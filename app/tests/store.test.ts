import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addExpense, loadExpenses, saveExpenses } from '../src/store';
import type { Expense } from '../src/types';

describe('loadExpenses / saveExpenses', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'kakeibo-test-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('ファイルがなければ空配列を返す', () => {
    expect(loadExpenses(join(dir, 'missing.json'))).toEqual([]);
  });

  it('保存した内容をそのまま読み込める', () => {
    const filePath = join(dir, 'expenses.json');
    const expenses: Expense[] = [
      { id: 1, date: '2026-07-01', category: '食費', amount: 1200, memo: 'スーパー' }
    ];
    saveExpenses(filePath, expenses);
    expect(loadExpenses(filePath)).toEqual(expenses);
  });
});

describe('addExpense', () => {
  it('空の一覧に追加するとIDは1になる', () => {
    const result = addExpense([], {
      date: '2026-07-01',
      category: '食費',
      amount: 1200
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(1);
  });

  it('既存の最大ID+1が採番される', () => {
    const existing: Expense[] = [
      { id: 1, date: '2026-07-01', category: '食費', amount: 1200 },
      { id: 5, date: '2026-07-02', category: '交通費', amount: 460 }
    ];
    const result = addExpense(existing, {
      date: '2026-07-03',
      category: '娯楽',
      amount: 800
    });
    expect(result[2]?.id).toBe(6);
  });

  it('元の配列は変更しない', () => {
    const existing: Expense[] = [
      { id: 1, date: '2026-07-01', category: '食費', amount: 1200 }
    ];
    addExpense(existing, { date: '2026-07-02', category: '交通費', amount: 460 });
    expect(existing).toHaveLength(1);
  });
});
