import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCycleHistory, ensureCycle, getCycleContext, renameItem } from '../netlify/functions/accounting-checklist.js';

function state(templateItems = [], cycles = {}) {
  return { version: 1, templateItems, cycles };
}

test('even months use the current cycle and become urgent on day 20', () => {
  const result = getCycleContext(state(), new Date('2026-10-28T01:00:00Z'));
  assert.equal(result.key, '2026-10');
  assert.equal(result.dueDate, '2026-10-31');
  assert.equal(result.urgent, true);
  assert.equal(result.overdue, false);
});

test('odd months retain an incomplete previous cycle but advance after completion', () => {
  const incomplete = state([], { '2026-10': { key: '2026-10', items: [{ completed: false }] } });
  assert.deepEqual(getCycleContext(incomplete, new Date('2026-11-10T01:00:00Z')).key, '2026-10');
  assert.equal(getCycleContext(incomplete, new Date('2026-11-10T01:00:00Z')).overdue, true);
  incomplete.cycles['2026-10'].items[0].completed = true;
  assert.equal(getCycleContext(incomplete, new Date('2026-11-10T01:00:00Z')).key, '2026-12');
});

test('new cycles copy fixed templates without carrying completion state', () => {
  const value = state([{ id: 'template-1', label: '銀行存摺影本' }]);
  let counter = 0;
  assert.equal(ensureCycle(value, '2026-12', () => `item-${++counter}`), true);
  assert.deepEqual(value.cycles['2026-12'].items.map(({ templateId, label, persistent, completed }) => ({ templateId, label, persistent, completed })), [
    { templateId: 'template-1', label: '銀行存摺影本', persistent: true, completed: false },
  ]);
  assert.equal(ensureCycle(value, '2026-12', () => 'unexpected'), false);
  assert.equal(value.cycles['2026-12'].items.length, 1);
});

test('renaming a fixed item updates its template and current or future cycles only', () => {
  const value = state([{ id: 'template-1', label: '舊名稱' }], {
    '2026-08': { items: [{ id: 'old-item', templateId: 'template-1', persistent: true, label: '舊名稱' }] },
    '2026-10': { items: [{ id: 'current-item', templateId: 'template-1', persistent: true, label: '舊名稱' }] },
    '2026-12': { items: [{ id: 'future-item', templateId: 'template-1', persistent: true, label: '舊名稱' }] },
  });
  renameItem(value, '2026-10', value.cycles['2026-10'].items[0], '新名稱');
  assert.equal(value.templateItems[0].label, '新名稱');
  assert.equal(value.cycles['2026-08'].items[0].label, '舊名稱');
  assert.equal(value.cycles['2026-10'].items[0].label, '新名稱');
  assert.equal(value.cycles['2026-12'].items[0].label, '新名稱');
});

test('history includes only earlier cycles in reverse order with completion summaries', () => {
  const value = state([], {
    '2026-06': { items: [{ label: '舊項目', completed: true }] },
    '2026-08': { items: [{ label: '項目 A', completed: true }, { label: '項目 B', completed: false }] },
    '2026-10': { items: [{ label: '本期項目', completed: false }] },
    '2026-12': { items: [{ label: '未來項目', completed: false }] },
  });
  const history = buildCycleHistory(value, '2026-10');
  assert.deepEqual(history.map((entry) => entry.cycle), ['2026-08', '2026-06']);
  assert.deepEqual(
    history.map(({ completedCount, totalCount, complete }) => ({ completedCount, totalCount, complete })),
    [
      { completedCount: 1, totalCount: 2, complete: false },
      { completedCount: 1, totalCount: 1, complete: true },
    ],
  );
});
