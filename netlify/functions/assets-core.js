export const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
export const DRIVE_FULL_SCOPE = 'https://www.googleapis.com/auth/drive';
export const DRIVE_FOLDER_MIME = 'application/vnd.google-apps.folder';
export const PENDING_DELETION_FOLDER = '_待刪除';

const HELPER_NAMES = new Set(['.DS_Store', 'adobe-stock.png']);
const HELPER_EXTENSIONS = new Set(['command']);
const PREVIEW_ORDER = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];

const CATEGORY_GROUPS = new Map([
  ['01_圖示', '圖示'],
  ['02_介面素材', 'UI 素材'],
  ['03_行銷節慶', '行銷節慶'],
  ['04_印刷版型', '印刷版型'],
  ['05_圖片', '圖片'],
  ['06_動態素材', '動態素材'],
  ['icons', '圖示'],
  ['icon', '圖示'],
  ['logistic icon', '圖示'],
  ['英文設計字母', '圖示'],
  ['ui', 'UI 素材'],
  ['ui kit', 'UI 素材'],
  ['bizcard', '印刷版型'],
  ['名片', '印刷版型'],
  ['a4 dm', '印刷版型'],
  ['三折頁', '印刷版型'],
  ['易拉展大海報', '印刷版型'],
  ['social post template', '行銷節慶'],
  ['social post', '行銷節慶'],
  ['birthdaycard', '行銷節慶'],
  ['birthday card', '行銷節慶'],
  ['christmas', '行銷節慶'],
  ['mid-autumn festival', '行銷節慶'],
  ['images', '圖片'],
  ['pic', '圖片'],
  ['abstract', '圖片'],
  ['冷鏈', '圖片'],
  ['客服', '圖片'],
]);

export function hasDriveReadScope(scopes) {
  const granted = new Set(String(scopes || '').split(/\s+/).filter(Boolean));
  return granted.has(DRIVE_READONLY_SCOPE) || granted.has(DRIVE_FULL_SCOPE);
}

export function hasDriveWriteScope(scopes) {
  const granted = new Set(String(scopes || '').split(/\s+/).filter(Boolean));
  return granted.has(DRIVE_FULL_SCOPE);
}

export function isPendingDeletionPath(path = []) {
  return path.some((part) => String(part).trim() === PENDING_DELETION_FOLDER);
}
export function extensionOf(name) {
  const match = /\.([^.]+)$/.exec(String(name || ''));
  return match ? match[1].toLowerCase() : '';
}

export function stemOf(name) {
  return String(name || '').replace(/\.[^.]+$/, '');
}

export function shouldIgnoreFile(file) {
  const name = String(file?.name || '');
  const trimmed = name.trim();
  return (
    HELPER_NAMES.has(name) ||
    HELPER_NAMES.has(trimmed) ||
    HELPER_EXTENSIONS.has(extensionOf(name)) ||
    /^Icon\r?$/.test(name)
  );
}

export function meaningfulPath(path = []) {
  const parts = [...path];
  if (parts[0] && /^00_待整理_/i.test(parts[0])) parts.shift();
  if (parts[0] === '已上傳到 DGHM>GoogleDrive') parts.shift();
  return parts;
}

export function categoryFor(path = []) {
  const clean = meaningfulPath(path);
  const topLevel = clean[0] || '未分類';
  const organized = /^\d{2}_/.test(topLevel);
  const sourceCategory = organized ? (clean[1] || topLevel.replace(/^\d{2}_/, '')) : topLevel;
  const category = CATEGORY_GROUPS.get(topLevel.toLowerCase()) || '其他';
  return { category, sourceCategory };
}

function previewRank(variant) {
  const rank = PREVIEW_ORDER.indexOf(variant.extension);
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
}

function stockIdFor(asset) {
  const haystack = [asset.title, asset.path, asset.sourceCategory].join(' ');
  const match = /AdobeStock[_-](\d+)/i.exec(haystack);
  return match ? `AdobeStock_${match[1]}` : '';
}

export function buildAssetIndex(files, options = {}) {
  const groups = new Map();
  let ignoredFiles = 0;

  for (const file of files || []) {
    if (!file || file.mimeType === DRIVE_FOLDER_MIME) continue;
    if (isPendingDeletionPath(file.path)) continue;
    if (shouldIgnoreFile(file)) {
      ignoredFiles += 1;
      continue;
    }

    const path = Array.isArray(file.path) ? file.path : [];
    const title = stemOf(file.name);
    const directory = path.join('/');
    const key = `${directory}/${title}`.toLocaleLowerCase('zh-Hant');
    const { category, sourceCategory } = categoryFor(path);
    const extension = extensionOf(file.name);
    const variant = {
      id: file.id,
      name: file.name,
      extension,
      mimeType: file.mimeType || 'application/octet-stream',
      size: Number(file.size || 0),
      modifiedTime: file.modifiedTime || '',
      md5Checksum: file.md5Checksum || '',
      thumbnailLink: file.thumbnailLink || '',
      webViewLink: file.webViewLink || `https://drive.google.com/open?id=${encodeURIComponent(file.id)}`,
      parentId: file.parentId || '',
    };

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        title,
        category,
        sourceCategory,
        path: [...path, file.name].join('/'),
        directory,
        variants: [],
      });
    }
    groups.get(key).variants.push(variant);
  }

  const assets = [...groups.values()].map((asset) => {
    asset.variants.sort((a, b) => {
      const previewDiff = previewRank(a) - previewRank(b);
      return previewDiff || a.extension.localeCompare(b.extension);
    });
    asset.preview = asset.variants.find((variant) => previewRank(variant) < Number.MAX_SAFE_INTEGER) || null;
    asset.formats = [...new Set(asset.variants.map((variant) => variant.extension || 'file'))];
    asset.stockId = stockIdFor(asset);
    asset.totalSize = asset.variants.reduce((sum, variant) => sum + variant.size, 0);
    asset.searchText = [
      asset.title,
      asset.stockId,
      asset.category,
      asset.sourceCategory,
      asset.directory,
      asset.formats.join(' '),
    ].join(' ').toLocaleLowerCase('zh-Hant');
    return asset;
  });

  assets.sort((a, b) =>
    a.category.localeCompare(b.category, 'zh-Hant') ||
    a.sourceCategory.localeCompare(b.sourceCategory, 'zh-Hant') ||
    a.title.localeCompare(b.title, 'zh-Hant', { numeric: true })
  );

  const categoryCounts = {};
  for (const asset of assets) categoryCounts[asset.category] = (categoryCounts[asset.category] || 0) + 1;

  return {
    version: 2,
    generatedAt: options.generatedAt || new Date().toISOString(),
    rootFolderId: options.rootFolderId || '',
    stats: {
      assets: assets.length,
      files: assets.reduce((sum, asset) => sum + asset.variants.length, 0),
      ignoredFiles,
      categories: categoryCounts,
    },
    assets,
  };
}
