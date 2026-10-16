import { getStore } from '@netlify/blobs';
import crypto from 'node:crypto';
import {
  DRIVE_FULL_SCOPE,
  DRIVE_FOLDER_MIME,
  DRIVE_READONLY_SCOPE,
  PENDING_DELETION_FOLDER,
  buildAssetIndex,
  hasDriveReadScope,
  hasDriveWriteScope,
  isPendingDeletionPath,
  meaningfulPath,
} from './assets-core.js';

const SESSION_COOKIE = 'dghm_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'insecure-dev-secret-please-set-SESSION_SECRET';
const CACHE_KEY = 'drive-index-v1';
const CACHE_MAX_AGE = 15 * 60 * 1000;
const MAX_DRIVE_ITEMS = 15000;
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024;
const MAX_ARCHIVE_FILES = 24;

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

async function driveJson(url, accessToken, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  const response = await fetch(url, { ...options, headers });
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
  const folders = [{ id: rootFolderId, name: '素材庫根目錄', path: [] }];

  while (queue.length) {
    const batch = queue.splice(0, 8);
    const listings = await Promise.all(
      batch.map(async (folder) => ({ folder, children: await listFolder(folder.id, accessToken) }))
    );
    for (const { folder, children } of listings) {
      for (const child of children) {
        if (files.length >= MAX_DRIVE_ITEMS) throw new Error(`素材數超過安全上限 ${MAX_DRIVE_ITEMS}`);
        if (child.mimeType === DRIVE_FOLDER_MIME) {
          const path = [...folder.path, child.name];
          if (isPendingDeletionPath(path)) continue;
          folders.push({ id: child.id, name: child.name, path });
          queue.push({ id: child.id, path });
        } else {
          files.push({ ...child, path: folder.path, parentId: folder.id });
        }
      }
    }
  }
  return { files, folders };
}

function uploadDestinations(folders, rootFolderId) {
  const destinations = [{ id: rootFolderId, label: '素材庫根目錄', path: '' }];
  for (const folder of folders) {
    if (folder.id === rootFolderId || isPendingDeletionPath(folder.path)) continue;
    const clean = meaningfulPath(folder.path);
    if (clean.length !== 1) continue;
    destinations.push({ id: folder.id, label: clean[0], path: folder.path.join('/') });
  }
  destinations.sort((a, b) => a.label.localeCompare(b.label, 'zh-Hant', { numeric: true }));
  return destinations;
}

async function readCachedIndex(rootFolderId) {
  const store = getStore('asset-library');
  const cached = await store.get(CACHE_KEY, { type: 'json' });
  if (!cached || cached.version !== 2 || cached.rootFolderId !== rootFolderId || !cached.generatedAt) return null;
  if (Date.now() - new Date(cached.generatedAt).getTime() > CACHE_MAX_AGE) return null;
  return cached;
}

async function getIndex(rootFolderId, accessToken, refresh = false) {
  if (!refresh) {
    const cached = await readCachedIndex(rootFolderId);
    if (cached) return { index: cached, cached: true };
  }
  const { files, folders } = await crawlDrive(rootFolderId, accessToken);
  const index = buildAssetIndex(files, { rootFolderId });
  index.destinations = uploadDestinations(folders, rootFolderId);
  const store = getStore('asset-library');
  await store.setJSON(CACHE_KEY, index);
  return { index, cached: false };
}

async function authorize(req, options = {}) {
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
  if (options.write && !hasDriveWriteScope(user.googleScopes)) {
    return {
      response: json(409, {
        ok: false,
        code: 'drive_write_grant_required',
        error: '需要啟用 Google Drive 素材管理權限',
        authorizeUrl: '/api/auth/login/google?grant=assets-manage',
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

function assertSameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin || origin !== new URL(req.url).origin) {
    const error = new Error('無效的操作來源');
    error.status = 403;
    throw error;
  }
}

async function readJsonBody(req) {
  const size = Number(req.headers.get('content-length') || 0);
  if (size > 32768) throw Object.assign(new Error('請求內容過大'), { status: 413 });
  return req.json().catch(() => {
    throw Object.assign(new Error('請求格式錯誤'), { status: 400 });
  });
}

async function clearIndexCache() {
  const store = getStore('asset-library');
  await store.delete(CACHE_KEY).catch(() => {});
}

async function ensurePendingFolder(rootFolderId, accessToken) {
  const rootChildren = await listFolder(rootFolderId, accessToken);
  const existing = rootChildren.find((item) =>
    item.mimeType === DRIVE_FOLDER_MIME && item.name === PENDING_DELETION_FOLDER
  );
  if (existing) return existing.id;

  const created = await driveJson(
    'https://www.googleapis.com/drive/v3/files?fields=id&supportsAllDrives=true',
    accessToken,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: PENDING_DELETION_FOLDER,
        mimeType: DRIVE_FOLDER_MIME,
        parents: [rootFolderId],
      }),
    }
  );
  return created.id;
}

async function mapInBatches(items, limit, callback) {
  for (let index = 0; index < items.length; index += limit) {
    await Promise.all(items.slice(index, index + limit).map(callback));
  }
}

function safeFilename(name) {
  return String(name || 'asset').replace(/[\r\n]/g, ' ').slice(0, 240);
}

export default async (req, context) => {
  if (!['GET', 'POST'].includes(req.method)) return json(405, { ok: false, error: 'Method Not Allowed' });

  try {
    const action = context.params.action;
    const writeAction = req.method === 'POST' && (action === 'upload-session' || action === 'archive');
    if (writeAction) assertSameOrigin(req);
    const rootFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    if (!rootFolderId) return json(503, { ok: false, code: 'root_not_configured', error: '尚未設定素材庫根資料夾' });

    const auth = await authorize(req, { write: writeAction });
    if (auth.response) return auth.response;
    const root = await assertRootAccess(rootFolderId, auth.accessToken);

    if (action === 'status') {
      return json(200, {
        ok: true,
        granted: true,
        scope: hasDriveWriteScope(auth.user.googleScopes) ? DRIVE_FULL_SCOPE : DRIVE_READONLY_SCOPE,
        writable: hasDriveWriteScope(auth.user.googleScopes),
        manageAuthorizeUrl: '/api/auth/login/google?grant=assets-manage',
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

    if (action === 'upload-session' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const filename = safeFilename(body.name).replace(/[\\/\0]/g, ' ').trim();
      const mimeType = String(body.mimeType || 'application/octet-stream').slice(0, 160);
      const size = Number(body.size);
      const parentId = String(body.parentId || '');
      if (!filename) return json(400, { ok: false, error: '檔名不可空白' });
      if (!Number.isSafeInteger(size) || size < 0 || size > MAX_UPLOAD_SIZE) {
        return json(400, { ok: false, error: '單一檔案大小需小於 2 GB' });
      }

      const { index } = await getIndex(rootFolderId, auth.accessToken, false);
      const destinations = new Set((index.destinations || []).map((item) => item.id));
      if (!destinations.has(parentId)) return json(403, { ok: false, error: '上傳目標不在素材庫允許範圍內' });

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json; charset=utf-8',
            'X-Upload-Content-Type': mimeType,
            'X-Upload-Content-Length': String(size),
            Origin: new URL(req.url).origin,
          },
          body: JSON.stringify({ name: filename, mimeType, parents: [parentId] }),
        }
      );
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw Object.assign(new Error(detail.error?.message || '無法建立 Google Drive 上傳工作'), { status: response.status });
      }
      const uploadUrl = response.headers.get('location');
      if (!uploadUrl) throw new Error('Google Drive 未回傳上傳網址');
      return json(200, { ok: true, uploadUrl });
    }

    if (action === 'archive' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const ids = [...new Set(Array.isArray(body.ids) ? body.ids.map(String) : [])];
      if (!ids.length || ids.length > MAX_ARCHIVE_FILES) {
        return json(400, { ok: false, error: `一次可移動 1–${MAX_ARCHIVE_FILES} 個檔案` });
      }

      const { index } = await getIndex(rootFolderId, auth.accessToken, false);
      const variants = index.assets.flatMap((asset) => asset.variants);
      const allowed = new Map(variants.map((item) => [item.id, item]));
      const targets = ids.map((id) => allowed.get(id));
      if (targets.some((item) => !item || !item.parentId)) {
        return json(403, { ok: false, error: '包含不在素材庫範圍內的檔案' });
      }

      const pendingFolderId = await ensurePendingFolder(rootFolderId, auth.accessToken);
      await mapInBatches(targets, 6, async (item) => {
        const params = new URLSearchParams({
          addParents: pendingFolderId,
          removeParents: item.parentId,
          fields: 'id,parents',
          supportsAllDrives: 'true',
        });
        await driveJson(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(item.id)}?${params}`,
          auth.accessToken,
          { method: 'PATCH' }
        );
      });
      await clearIndexCache();
      return json(200, { ok: true, archived: targets.length, folderName: PENDING_DELETION_FOLDER });
    }

    return json(404, { ok: false, error: 'Not Found' });
  } catch (error) {
    const rawStatus = Number(error?.status || 0);
    const status = [400, 401, 403, 409, 413].includes(rawStatus) ? rawStatus : rawStatus === 404 ? 403 : 500;
    return json(status, {
      ok: false,
      code: status === 403 ? 'root_access_denied' : 'drive_error',
      error: error instanceof Error ? error.message : 'Google Drive 操作失敗',
    });
  }
};

export const config = { path: '/api/assets/:action' };
