import test from 'node:test';
import assert from 'node:assert/strict';
import { DASHBOARD_PANEL_IDS, sanitizeHiddenPanels } from '../netlify/functions/dashboard-preferences.js';

test('dashboard panel allowlist contains every customizable section', () => {
  assert.deepEqual(DASHBOARD_PANEL_IDS, ['today', 'reminders', 'review', 'monitoring', 'primary', 'workflow', 'tools']);
});

test('hidden panel preferences reject unknown values and remove duplicates', () => {
  assert.deepEqual(sanitizeHiddenPanels(['review', 'unknown', 'review', 42, 'tools']), ['review', 'tools']);
  assert.deepEqual(sanitizeHiddenPanels(null), []);
});
