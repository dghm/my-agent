import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssetIndex,
  categoryFor,
  hasDriveReadScope,
  meaningfulPath,
  shouldIgnoreFile,
} from '../netlify/functions/assets-core.js';
import authHandler from '../netlify/functions/auth.js';

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
test('Drive scopes accept readonly and reject drive.file', () => {
  assert.equal(hasDriveReadScope('openid https://www.googleapis.com/auth/drive.readonly'), true);
  assert.equal(hasDriveReadScope('openid https://www.googleapis.com/auth/drive'), true);
  assert.equal(hasDriveReadScope('openid https://www.googleapis.com/auth/drive.file'), false);
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
