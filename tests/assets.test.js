import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssetIndex,
  categoryFor,
  hasDriveReadScope,
  hasDriveWriteScope,
  isPendingDeletionPath,
  meaningfulPath,
  shouldIgnoreFile,
} from '../netlify/functions/assets-core.js';
import authHandler from '../netlify/functions/auth.js';
import assetsHandler from '../netlify/functions/assets.js';

test('asset grant requests Drive readonly and returns to the asset library', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
  try {
    const response = await authHandler(
      new Request('https://my-agent.dghm.tw/api/auth/login/google?grant=assets')
    );
    assert.equal(response.status, 302);
    const location = new URL(response.headers.get('location'));
    const scopes = new Set((location.searchParams.get('scope') || '').split(' '));
    assert.equal(scopes.has('https://www.googleapis.com/auth/drive.readonly'), true);
    assert.equal(scopes.has('https://www.googleapis.com/auth/drive'), false);
    assert.equal(location.searchParams.get('redirect_uri'), 'https://my-agent.dghm.tw/api/auth/callback/google');
    assert.match(response.headers.get('set-cookie') || '', /dghm_oauth_return=%2Fasset-library\.html/);
  } finally {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  }
});

test('asset management grant requests full Drive access', async () => {
  const originalClientId = process.env.GOOGLE_CLIENT_ID;
  process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
  try {
    const response = await authHandler(
      new Request('https://my-agent.dghm.tw/api/auth/login/google?grant=assets-manage')
    );
    const location = new URL(response.headers.get('location'));
    const scopes = new Set((location.searchParams.get('scope') || '').split(' '));
    assert.equal(scopes.has('https://www.googleapis.com/auth/drive'), true);
    assert.equal(scopes.has('https://www.googleapis.com/auth/drive.readonly'), false);
    assert.match(response.headers.get('set-cookie') || '', /dghm_oauth_return=%2Fasset-library\.html/);
  } finally {
    if (originalClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalClientId;
  }
});

test('Drive scopes accept readonly and reject drive.file', () => {
  assert.equal(hasDriveReadScope('openid https://www.googleapis.com/auth/drive.readonly'), true);
  assert.equal(hasDriveReadScope('openid https://www.googleapis.com/auth/drive'), true);
  assert.equal(hasDriveReadScope('openid https://www.googleapis.com/auth/drive.file'), false);
  assert.equal(hasDriveWriteScope('openid https://www.googleapis.com/auth/drive.readonly'), false);
  assert.equal(hasDriveWriteScope('openid https://www.googleapis.com/auth/drive'), true);
});

test('pending deletion paths are excluded from the asset index', () => {
  assert.equal(isPendingDeletionPath(['ICONs', '_待刪除']), true);
  assert.equal(isPendingDeletionPath(['ICONs']), false);
  const index = buildAssetIndex([
    { id: 'archived', name: 'old.svg', mimeType: 'image/svg+xml', path: ['_待刪除'] },
    { id: 'active', name: 'active.svg', mimeType: 'image/svg+xml', path: ['ICONs'], parentId: 'icons' },
  ]);
  assert.equal(index.version, 3);
  assert.equal(index.stats.assets, 1);
  assert.equal(index.assets[0].variants[0].parentId, 'icons');
});

test('asset write endpoints reject foreign origins before accessing Drive', async () => {
  const response = await assetsHandler(
    new Request('https://my-agent.dghm.tw/api/assets/archive', {
      method: 'POST',
      headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ['file-1'] }),
    }),
    { params: { action: 'archive' } }
  );
  assert.equal(response.status, 403);
  assert.match(await response.text(), /無效的操作來源/);
});

test('staging wrapper folders do not become categories', () => {
  assert.deepEqual(
    meaningfulPath(['00_待整理_2026-10-15', '已上傳到 DGHM>GoogleDrive', 'BirthdayCard', 'AdobeStock_1']),
    ['BirthdayCard', 'AdobeStock_1']
  );
  assert.deepEqual(categoryFor(['00_待整理_2026-10-15', 'UI Kit']), {
    category: 'UI 素材',
    sourceCategory: 'UI Kit',
  });
});

test('organized Chinese folders use the top level as category and child as source', () => {
  assert.deepEqual(categoryFor(['01_圖示', '一般圖示', 'AdobeStock_1']), {
    category: '圖示',
    sourceCategory: '一般圖示',
  });
  assert.deepEqual(categoryFor(['03_行銷節慶', '生日卡片']), {
    category: '行銷節慶',
    sourceCategory: '生日卡片',
  });
});

test('helper files are excluded from the library', () => {
  assert.equal(shouldIgnoreFile({ name: '.DS_Store' }), true);
  assert.equal(shouldIgnoreFile({ name: 'ai_to_svg_and_png_export.command' }), true);
  assert.equal(shouldIgnoreFile({ name: 'icon-001.svg' }), false);
});

test('same-stem variants become one searchable asset', () => {
  const files = [
    {
      id: 'png-1',
      name: 'icon-001.png',
      mimeType: 'image/png',
      size: '100',
      thumbnailLink: 'https://example.test/thumb',
      path: ['ICONs', 'AdobeStock_123'],
    },
    {
      id: 'svg-1',
      name: 'icon-001.svg',
      mimeType: 'image/svg+xml',
      size: '50',
      path: ['ICONs', 'AdobeStock_123'],
    },
    {
      id: 'helper',
      name: '.DS_Store',
      mimeType: 'application/octet-stream',
      path: ['ICONs'],
    },
  ];

  const index = buildAssetIndex(files, { rootFolderId: 'root', generatedAt: '2026-10-15T00:00:00.000Z' });
  assert.equal(index.stats.assets, 1);
  assert.equal(index.stats.files, 2);
  assert.equal(index.stats.ignoredFiles, 1);
  assert.deepEqual(index.assets[0].formats, ['png', 'svg']);
  assert.equal(index.assets[0].category, '圖示');
  assert.equal(index.assets[0].stockId, 'AdobeStock_123');
  assert.equal(index.assets[0].preview.id, 'png-1');
});

test('asset metadata adds searchable tags and descriptions to a whole format group', () => {
  const index = buildAssetIndex([
    { id: 'png-transport', name: 'AdobeStock_220758439.png', mimeType: 'image/png', path: ['01_圖示', '一般圖示'] },
    { id: 'svg-transport', name: 'AdobeStock_220758439.svg', mimeType: 'image/svg+xml', path: ['01_圖示', '一般圖示'] },
  ], {
    metadata: {
      entries: {
        AdobeStock_220758439: {
          tags: ['交通運輸', 'Transportation'],
          description: '汽車、公車、火車與飛機圖示',
        },
      },
    },
  });
  assert.equal(index.assets.length, 1);
  assert.equal(index.assets[0].metadataKey, 'AdobeStock_220758439');
  assert.deepEqual(index.assets[0].tags, ['交通運輸', 'Transportation']);
  assert.match(index.assets[0].searchText, /transportation/);
  assert.match(index.assets[0].searchText, /飛機圖示/);
});
