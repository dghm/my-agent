import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPreviewItems } from '../netlify/functions/greeting-cards.js';

test('single-line greetings keep their Airtable line structure', () => {
  const greeting = '人生境遇總是這般奇特，不管是工作還是人生，願我們都能實現我們想要的。';
  const cards = [{
    id: 'recGreetingLineTest',
    fields: {
      flddlYmss0faJe03E: '2026',
      fldeUIsh9wBncgniM: '聖誕',
      fld4dZDrUQVIkJQtY: ['recRecipientLineTest'],
      fldCWeUDJoFdBv7NV: ['親友'],
      fldMGXuTJQU5zBhCA: greeting,
      fldwFU60KWNU6DDSO: '2026-christmas',
      fldoFfIhXP7xFZBns: '個人',
      fldMUV5TYeFKvcGSN: 'From 羊',
      fldVmZeqkd1B4pjiv: '個人中文名',
      fldsQ6TklClpsV78A: '已發布',
      fldmsyGUo4XK2JejX: '0123456789abcdef0123456789abcdef01234567',
    },
  }];
  const recipients = [{
    id: 'recRecipientLineTest',
    fields: {
      fldnpDUlEhbqfuzGz: '倪運昌',
      fldhzttF6DtLL7ctq: '羊',
      fldzUAZDgjfXl61mf: '親友',
    },
  }];

  const items = buildPreviewItems(cards, recipients, [], {
    year: '2026', festival: '聖誕', template: '2026-christmas',
  });

  assert.deepEqual(items[0].greetingLines, [greeting]);
});
