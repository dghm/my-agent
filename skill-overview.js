(function () {
  'use strict';

  var MAX_ENTRY_SIZE = 20 * 1024 * 1024;
  var MAX_TOTAL_SIZE = 50 * 1024 * 1024;
  var skills = [];
  var activeId = '';
  var fileInput = document.getElementById('skill-file');
  var dropzone = document.getElementById('skill-dropzone');
  var message = document.getElementById('skill-message');
  var list = document.getElementById('skill-list');
  var count = document.getElementById('skill-count');
  var detail = document.getElementById('skill-detail');

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showMessage(text, isError) {
    message.textContent = text;
    message.className = 'skill-message' + (isError ? ' is-error' : '');
    message.hidden = false;
  }

  function readUint16(view, offset) {
    return view.getUint16(offset, true);
  }

  function readUint32(view, offset) {
    return view.getUint32(offset, true);
  }

  function findEndOfCentralDirectory(view) {
    var start = Math.max(0, view.byteLength - 65557);
    for (var offset = view.byteLength - 22; offset >= start; offset -= 1) {
      if (readUint32(view, offset) === 0x06054b50) return offset;
    }
    return -1;
  }

  function decodeName(bytes, utf8) {
    return new TextDecoder(utf8 ? 'utf-8' : 'utf-8').decode(bytes);
  }

  function parseZipDirectory(buffer) {
    var view = new DataView(buffer);
    var endOffset = findEndOfCentralDirectory(view);
    if (endOffset < 0) throw new Error('這不是可讀取的 ZIP／.skill 套件。');
    var entryCount = readUint16(view, endOffset + 10);
    var centralOffset = readUint32(view, endOffset + 16);
    var offset = centralOffset;
    var entries = [];
    var totalSize = 0;

    for (var i = 0; i < entryCount; i += 1) {
      if (readUint32(view, offset) !== 0x02014b50) {
        throw new Error('ZIP 目錄格式不完整。');
      }
      var flags = readUint16(view, offset + 8);
      var method = readUint16(view, offset + 10);
      var compressedSize = readUint32(view, offset + 20);
      var size = readUint32(view, offset + 24);
      var nameLength = readUint16(view, offset + 28);
      var extraLength = readUint16(view, offset + 30);
      var commentLength = readUint16(view, offset + 32);
      var localOffset = readUint32(view, offset + 42);
      var nameBytes = new Uint8Array(buffer, offset + 46, nameLength);
      var name = decodeName(nameBytes, Boolean(flags & 0x0800));

      if (flags & 0x0001) throw new Error('目前不支援有密碼的 .skill 套件。');
      if (size > MAX_ENTRY_SIZE) throw new Error('套件中有檔案超過 20 MB，已停止解析。');
      totalSize += size;
      if (totalSize > MAX_TOTAL_SIZE) throw new Error('套件解壓後超過 50 MB，已停止解析。');
      entries.push({
        name: name,
        method: method,
        compressedSize: compressedSize,
        size: size,
        localOffset: localOffset,
        directory: name.endsWith('/'),
      });
      offset += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  }

  async function extractEntry(buffer, entry) {
    if (entry.directory) return new Uint8Array();
    var view = new DataView(buffer);
    var offset = entry.localOffset;
    if (readUint32(view, offset) !== 0x04034b50) throw new Error('找不到套件內的檔案資料。');
    var nameLength = readUint16(view, offset + 26);
    var extraLength = readUint16(view, offset + 28);
    var dataOffset = offset + 30 + nameLength + extraLength;
    var compressed = new Uint8Array(buffer, dataOffset, entry.compressedSize);

    if (entry.method === 0) return compressed.slice();
    if (entry.method !== 8) throw new Error('套件使用目前不支援的 ZIP 壓縮方式。');
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('這個瀏覽器版本不支援本機解壓縮，請更新 Chrome、Edge 或 Safari。');
    }
    var stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function unquote(value) {
    var trimmed = String(value || '').trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }

  function parseSkillMarkdown(source) {
    var normalized = source.replace(/^\uFEFF/, '');
    var metadata = {};
    var body = normalized;
    var match = normalized.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    if (match) {
      match[1].split(/\r?\n/).forEach(function (line) {
        var field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
        if (field) metadata[field[1]] = unquote(field[2]);
      });
      body = normalized.slice(match[0].length);
    }
    return { metadata: metadata, body: body };
  }

  function cleanMarkdown(text) {
    return String(text || '')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[#>*_`|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function firstSentence(text, fallback) {
    var cleaned = cleanMarkdown(text);
    if (!cleaned) return fallback;
    var sentence = cleaned.match(/^(.{1,180}?[。！？.!?])/);
    return sentence ? sentence[1] : cleaned.slice(0, 180);
  }

  function sectionText(body, names) {
    var escaped = names.map(function (name) {
      return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|');
    var match = body.match(new RegExp('^#{1,3}\\s+(?:' + escaped + ')\\s*$([\\s\\S]*?)(?=^#{1,3}\\s+|$)', 'im'));
    return match ? match[1].trim() : '';
  }

  function deriveSummary(parsed, filename) {
    var description = parsed.metadata.description || '';
    var intro = parsed.body.replace(/^#.+$/m, '').trim();
    var whenMatch = description.match(/當使用者(.+?)(?:時，|時,|時立即|時應|時可)/);
    var outputSection = sectionText(parsed.body, ['輸出規範', '輸出格式', 'Output', 'Outputs']);
    var outputFallback = parsed.body.match(/(?:輸出|產出)(?:為|成)([^。\n]{1,90})/);
    var platforms = [];
    if (/Claude/i.test(parsed.body + description)) platforms.push('Claude');
    if (/Codex/i.test(parsed.body + description)) platforms.push('Codex');
    if (/Gemini/i.test(parsed.body + description)) platforms.push('Gemini');
    if (/ChatGPT|OpenAI/i.test(parsed.body + description)) platforms.push('ChatGPT / OpenAI');

    return {
      name: parsed.metadata.name || filename.replace(/\.skill$/i, ''),
      purpose: firstSentence(description, firstSentence(intro, '請查看原始 SKILL.md 了解用途。')),
      when: whenMatch
        ? '使用者' + cleanMarkdown(whenMatch[1]) + '時'
        : '當工作情境符合這個 Skill 的說明與啟動條件時。',
      output: outputSection
        ? firstSentence(outputSection, '依 SKILL.md 規範產出結果。')
        : (outputFallback ? '產出' + cleanMarkdown(outputFallback[1]) : '依 SKILL.md 規範產出結果。'),
      source: '.skill 套件（ZIP）／SKILL.md（Markdown）\n平台：' +
        (platforms.length ? platforms.join('、') + '（依內容推測）' : '未指定'),
    };
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  async function readSkillFile(file) {
    if (!/\.skill$/i.test(file.name)) throw new Error(file.name + '：請選擇副檔名為 .skill 的檔案。');
    var buffer = await file.arrayBuffer();
    var entries = parseZipDirectory(buffer);
    var skillEntry = entries.find(function (entry) {
      return !entry.directory && /(^|\/)SKILL\.md$/i.test(entry.name);
    });
    if (!skillEntry) throw new Error(file.name + '：套件中找不到 SKILL.md。');
    var bytes = await extractEntry(buffer, skillEntry);
    var source = new TextDecoder('utf-8').decode(bytes);
    var parsed = parseSkillMarkdown(source);
    var id = file.name + ':' + file.size + ':' + file.lastModified;
    return {
      id: id,
      filename: file.name,
      source: source,
      files: entries.filter(function (entry) { return !entry.directory; }),
      summary: deriveSummary(parsed, file.name),
    };
  }

  function renderList() {
    count.textContent = skills.length;
    if (!skills.length) return;
    list.innerHTML = skills.map(function (skill) {
      return '<button class="skill-card' + (skill.id === activeId ? ' is-active' : '') +
        '" type="button" data-skill-id="' + escapeHtml(skill.id) + '">' +
        '<strong>' + escapeHtml(skill.summary.name) + '</strong>' +
        '<span>' + escapeHtml(skill.summary.purpose) + '</span></button>';
    }).join('');
  }

  function renderDetail() {
    var skill = skills.find(function (item) { return item.id === activeId; });
    if (!skill) return;
    detail.innerHTML =
      '<div class="skill-detail-head"><div><p class="skill-package-name">' +
        escapeHtml(skill.filename) + '</p><h2>' + escapeHtml(skill.summary.name) +
        '</h2></div><span class="skill-format-badge">本機解析</span></div>' +
      '<div class="skill-summary-grid">' +
        summaryCard('可以幫我完成什麼', skill.summary.purpose) +
        summaryCard('何時適合使用', skill.summary.when) +
        summaryCard('輸出結果', skill.summary.output) +
        summaryCard('來源格式／平台', skill.summary.source) +
      '</div>' +
      '<section class="skill-subsection"><h3>套件檔案 · ' + skill.files.length + '</h3><ul class="skill-files">' +
        skill.files.map(function (entry) {
          return '<li><span>' + escapeHtml(entry.name) + '</span><span>' +
            escapeHtml(formatBytes(entry.size)) + '</span></li>';
        }).join('') +
      '</ul></section>' +
      '<section class="skill-subsection">' +
        '<button id="skill-raw-toggle" class="skill-raw-toggle" type="button" aria-expanded="false" aria-controls="skill-raw">' +
          '<span>查看原始 SKILL.md</span><span aria-hidden="true">＋</span></button>' +
        '<pre id="skill-raw" class="skill-raw" hidden><code>' + escapeHtml(skill.source) + '</code></pre>' +
      '</section>';
  }

  function summaryCard(title, text) {
    return '<section class="skill-summary-card"><h3>' + escapeHtml(title) +
      '</h3><p>' + escapeHtml(text) + '</p></section>';
  }

  async function addFiles(fileList) {
    var files = Array.from(fileList || []);
    if (!files.length) return;
    var added = 0;
    var errors = [];
    for (var i = 0; i < files.length; i += 1) {
      try {
        var skill = await readSkillFile(files[i]);
        var existingIndex = skills.findIndex(function (item) { return item.id === skill.id; });
        if (existingIndex >= 0) skills[existingIndex] = skill;
        else skills.push(skill);
        activeId = skill.id;
        added += 1;
      } catch (error) {
        errors.push(error.message || String(error));
      }
    }
    renderList();
    renderDetail();
    if (errors.length) showMessage(errors.join(' '), true);
    else showMessage('已在本機開啟 ' + added + ' 個 Skill；重新整理頁面後資料會清除。', false);
    fileInput.value = '';
  }

  fileInput.addEventListener('change', function () { addFiles(fileInput.files); });
  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInput.click();
    }
  });
  ['dragenter', 'dragover'].forEach(function (name) {
    dropzone.addEventListener(name, function (event) {
      event.preventDefault();
      dropzone.classList.add('is-dragging');
    });
  });
  ['dragleave', 'drop'].forEach(function (name) {
    dropzone.addEventListener(name, function (event) {
      event.preventDefault();
      dropzone.classList.remove('is-dragging');
    });
  });
  dropzone.addEventListener('drop', function (event) { addFiles(event.dataTransfer.files); });
  list.addEventListener('click', function (event) {
    var card = event.target.closest('[data-skill-id]');
    if (!card) return;
    activeId = card.dataset.skillId;
    renderList();
    renderDetail();
  });
  detail.addEventListener('click', function (event) {
    var toggle = event.target.closest('#skill-raw-toggle');
    if (!toggle) return;
    var raw = document.getElementById('skill-raw');
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.lastElementChild.textContent = expanded ? '＋' : '−';
    raw.hidden = expanded;
  });
})();
