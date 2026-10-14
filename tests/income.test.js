import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessIncome, normalizeIncomeInput, summarizeIncomeRecords } from '../netlify/functions/income.js';

const validInput = () => ({
  project: '網站改版',
  client: '測試客戶',
  amount: 42000,
  taxRate: 5,
  date: '2026-10-12',
  dueDate: '2026-11-12',
  paymentTerms: 'Net 30',
  paymentStatus: 'paid',
  receivedDate: '2026-11-12',
  receivedAmount: 44100,
  invoiceStatus: 'issued',
});

test('income allowlist is optional, trimmed and case-insensitive', () => {
  const session = { email: 'Owner@Example.com' };
  assert.equal(canAccessIncome(session, ''), true);
  assert.equal(canAccessIncome(session, ' other@example.com, owner@example.COM '), true);
  assert.equal(canAccessIncome(session, 'other@example.com'), false);
  assert.equal(canAccessIncome({}, 'owner@example.com'), false);
});

test('income input is normalized with safe defaults', () => {
  const result = normalizeIncomeInput({
    ...validInput(),
    project: '  網站改版  ',
    client: '  測試客戶  ',
    paymentStatus: 'unexpected',
    invoiceStatus: 'unexpected',
  });
  assert.equal(result.project, '網站改版');
  assert.equal(result.client, '測試客戶');
  assert.equal(result.amount, 42000);
  assert.equal(result.taxRate, 5);
  assert.equal(result.paymentStatus, 'unpaid');
  assert.equal(result.receivedDate, '');
  assert.equal(result.receivedAmount, 0);
  assert.equal(result.invoiceStatus, 'not_issued');
  assert.equal(result.invoiceDraft, null);
});

test('income input rejects invalid accounting values and calendar dates', () => {
  for (const input of [
    { ...validInput(), project: '' },
    { ...validInput(), amount: 0 },
    { ...validInput(), amount: 'not-a-number' },
    { ...validInput(), taxRate: -1 },
    { ...validInput(), taxRate: 101 },
    { ...validInput(), date: '2026-02-30' },
    { ...validInput(), dueDate: '2026/11/12' },
    { ...validInput(), receivedDate: '2026-02-30' },
    { ...validInput(), paymentStatus: 'partial', receivedAmount: 0 },
    { ...validInput(), paymentStatus: 'partial', receivedAmount: 44100 },
    { ...validInput(), paymentStatus: 'paid', receivedAmount: 40000 },
    { ...validInput(), paymentStatus: 'paid', receivedDate: '' },
  ]) {
    assert.throws(() => normalizeIncomeInput(input));
  }
});

test('income input records partial and full cash receipts consistently', () => {
  const partial = normalizeIncomeInput({
    ...validInput(),
    paymentStatus: 'partial',
    receivedAmount: 12000,
  });
  assert.equal(partial.paymentStatus, 'partial');
  assert.equal(partial.receivedDate, '2026-11-12');
  assert.equal(partial.receivedAmount, 12000);

  const paid = normalizeIncomeInput({ ...validInput(), receivedAmount: '' });
  assert.equal(paid.receivedAmount, 44100);
});

test('income invoice snapshot must have the expected bounded structure', () => {
  const invoiceDraft = {
    fields: { f_company_name: '測試客戶' },
    items: [{ desc: '第一期', price: 42000 }],
    terms: ['付款期限 30 天'],
  };
  assert.deepEqual(normalizeIncomeInput({ ...validInput(), invoiceDraft }).invoiceDraft, invoiceDraft);
  assert.throws(() => normalizeIncomeInput({ ...validInput(), invoiceDraft: { fields: {}, items: 'bad' } }));
});

test('income summary estimates sales tax only for issued invoices using each record tax rate', () => {
  const summary = summarizeIncomeRecords([
    { amount: 42000, taxRate: 5, paymentStatus: 'paid', receivedAmount: 44100, invoiceStatus: 'issued' },
    { amount: 10001, taxRate: 5, paymentStatus: 'partial', receivedAmount: 4000, invoiceStatus: 'issued' },
    { amount: 8000, taxRate: 5, paymentStatus: 'unpaid', invoiceStatus: 'not_issued' },
    { amount: 3000, taxRate: 0, paymentStatus: 'paid', invoiceStatus: 'issued' },
  ]);
  assert.deepEqual(summary, {
    count: 4,
    total: 63001,
    paid: 45000,
    unpaid: 18001,
    salesTax: 2600,
    invoiceTotal: 66001,
    received: 51100,
    outstanding: 14901,
  });
});
