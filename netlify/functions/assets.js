import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
import {
  DRIVE_FOLDER_MIME,
  DRIVE_READONLY_SCOPE,
  buildAssetIndex,
  hasDriveReadScope,
} from './assets-core.js';

const SESSION_COOKIE = 'dghm_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-please-set-SESSION_SECRET';
const CACHE_KEY = 'drive-index-v1';
const CACHE_MAX_AGE = 15 * 60 * 1000;
const MAX_DRIVE_ITEMS = 15000;

function json(status, payload, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function hmac(data) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

function getCookie(req, name) {
  const header = req.headers.get('cookie') || '';
  const match = header.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function verifySession(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig || hmac(data) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    return payload.exp && payload.exp >= Date.now() ? payload : null;
  } catch {
    return null;
  }
}

async function getGoogleUser(uid) {
  const store = getStore('members');
  const users = (await store.get('users', { type: 'json' })) || [];
  return users.find((user) => user.id === uid) || null;
}

async function getAccessToken(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return { ok: false, code: 'google_not_configured' };

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      code: data.error || 'token_failed',
      detail: data.error_description || `HTTP ${response.status}`,
    };
  }
  return { ok: true, accessToken: data.access_token };
}

async function driveJson(url, accessToken) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error?.message || `Google Drive API HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function assertRootAccess(rootFolderId, accessToken) {
  const fields = encodeURIComponent('id,name,mimeType,trashed');
  const data = await driveJson(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(rootFolderId)}?fields=${fields}&supportsAllDrives=true`,
    accessToken
  );
  if (data.trashed || data.mimeType !== DRIVE_FOLDER_MIME) throw new Error('素材庫根資料夾不存在或已移除');
  return data;
}

async function listFolder(folderId, accessToken) {
  const items = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${folderId.replace(/'/g, "\\'")}' in parents and trashed = false`,
      pageSize: '1000',
      orderBy: 'folder,name_natural',
      spaces: 'drive',
      fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime,md5Checksum,thumbnailLink,webViewLink)',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await driveJson(`https://www.googleapis.com/drive/v3/files?${params}`, accessToken);
    items.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return items;
}

async function crawlDrive(rootFolderId, accessToken) {
  const queue = [{ id: rootFolderId, path: [] }];
  const files = [];

  while (queue.length) {
    const batch = queue.splice(0, 8);
    const listings = await Promise.all(
      batch.map(async (folder) => ({ folder, children: await listFolder(folder.id, accessToken) }))
    );
    for (const { folder, children } of listings) {
      for (const child of children) {
        if (files.length >= MAX_DRIVE_ITEMS) throw new Error(`素材數超過安全上限 ${MAX_DRIVE_ITEMS}`);
        if (child.mimeType === DRIVE_FOLDER_MIME) {
          queue.push({ id: child.id, path: [...folder.path, child.name] });
        } else {
          files.push({ ...child, path: folder.path });
        }
      }
    }
  }
  return files;
}

async function readCachedIndex(rootFolderId) {
  const store = getStore('asset-library');
  const cached = await store.get(CACHE_KEY, { type: 'json' });
  if (!cached || cached.rootFolderId !== rootFolderId || !cached.generatedAt) return null;
  if (Date.now() - new Date(cached.generatedAt).getTime() > CACHE_MAX_AGE) return null;
  return cached;
}

async function getIndex(rootFolderId, accessToken, refresh = false) {
  if (!refresh) {
    const cached = await readCachedIndex(rootFolderId);
    if (cached) return { index: cached, cached: true };
  }
  const files = await crawlDrive(rootFolderId, accessToken);
  const index = buildAssetIndex(files, { rootFolderId });
  const store = getStore('asset-library');
  await store.setJSON(CACHE_KEY, index);
  return { index, cached: false };
}

async function authorize(req) {
  const session = verifySession(getCookie(req, SESSION_COOKIE));
  if (!session) return { response: json(401, { ok: false, code: 'unauthenticated', error: '請先登入 my-agent' }) };
  const user = await getGoogleUser(session.uid);
  if (!user || user.provider !== 'google' || !user.googleRefreshToken || !hasDriveReadScope(user.googleScopes)) {
    return {
      response: json(409, {
        ok: false,
        code: 'drive_grant_required',
        error: '尚未授權 Google Drive 唯讀權限',
        authorizeUrl: '/api/auth/login/google?grant=assets',
      }),
    };
  }
  const token = await getAccessToken(user.googleRefreshToken);
  if (!token.ok) {
    return {
      response: json(409, {
        ok: false,
        code: 'reauthorize_required',
        error: 'Google 授權已失效，請重新授權素材庫',
        authorizeUrl: '/api/auth/login/google?grant=assets',
      }),
    };
  }
  return { session, user, accessToken: token.accessToken };
}

function safeFilename(name) {
  return String(name || 'asset').replace(/[\r\n]/g, ' ').slice(0, 240);
}

export default async (req, context) => {
  if (req.method !== 'GET') return json(405, { ok: false, error: 'Method Not Allowed' });

  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) return json(503, { ok: false, code: 'root_not_configured', error: '尚未設定素材庫根資料夾' });

    const auth = await authorize(req);
    if (auth.response) return auth.response;
    const root = await assertRootAccess(rootFolderId, auth.accessToken);
    const action = context.params.action;

    if (action === 'status') {
      return json(200, {
        ok: true,
        granted: true,
        scope: DRIVE_READONLY_SCOPE,
        root: { id: root.id, name: root.name },
      });
    }

    if (action === 'index') {
      const refresh = new URL(req.url).searchParams.get('refresh') === '1';
      const result = await getIndex(rootFolderId, auth.accessToken, refresh);
      return json(200, { ok: true, cached: result.cached, ...result.index });
    }

    if (action === 'download') {
      const id = new URL(req.url).searchParams.get('id') || '';
      if (!id) return json(400, { ok: false, error: '缺少檔案 ID' });

      const { index } = await getIndex(rootFolderId, auth.accessToken, false);
      const variant = index.assets.flatMap((asset) => asset.variants).find((item) => item.id === id);
      if (!variant) return json(404, { ok: false, error: '檔案不在素材庫範圍內' });

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&supportsAllDrives=true`,
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      );
      if (!response.ok) return json(response.status, { ok: false, error: '無法從 Google Drive 下載檔案' });

      const filename = safeFilename(variant.name);
      const headers = new Headers({
        'Content-Type': response.headers.get('content-type') || variant.mimeType,
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, max-age=60',
      });
      const contentLength = response.headers.get('content-length');
      if (contentLength) headers.set('Content-Length', contentLength);
      return new Response(response.body, {
        status: 200,
        headers,
      });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (error) {
    const status = error?.status === 403 || error?.status === 404 ? 403 : 500;
    return json(status, {
      ok: false,
      code: status === 403 ? 'root_access_denied' : 'drive_error',
      error: error instanceof Error ? error.message : 'Google Drive 讀取失敗',
    });
  }
};

export const config = { path: '/api/assets/:action' };
