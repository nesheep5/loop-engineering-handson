import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addExpense,
  findExpense,
  loadExpenses,
  markDeleted,
  saveExpenses
} from '../src/store';
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

describe('findExpense', () => {
  const existing: Expense[] = [
    { id: 1, date: '2026-07-01', category: '食費', amount: 1200 },
    { id: 2, date: '2026-07-02', category: '交通費', amount: 460, deleted: true }
  ];

  it('該当IDの支出を返す', () => {
    expect(findExpense(existing, 1)?.category).toBe('食費');
  });

  it('削除済みの支出も返す（削除済み判定は呼び出し側に委ねる）', () => {
    expect(findExpense(existing, 2)?.deleted).toBe(true);
  });

  it('該当IDがなければ undefined を返す', () => {
    expect(findExpense(existing, 99)).toBeUndefined();
  });
});

describe('markDeleted', () => {
  const existing: Expense[] = [
    { id: 1, date: '2026-07-01', category: '食費', amount: 1200 },
    { id: 2, date: '2026-07-02', category: '交通費', amount: 460 },
    { id: 3, date: '2026-07-03', category: '娯楽', amount: 800 }
  ];

  it('指定IDに deleted:true を付与した配列を返す', () => {
    const result = markDeleted(existing, 2);
    expect(result.find((e) => e.id === 2)?.deleted).toBe(true);
  });

  it('指定ID以外はそのまま（deleted を付与しない）', () => {
    const result = markDeleted(existing, 2);
    expect(result.find((e) => e.id === 1)?.deleted).toBeUndefined();
    expect(result.find((e) => e.id === 3)?.deleted).toBeUndefined();
  });

  it('レコードは取り除かず件数を保つ（論理削除）', () => {
    const result = markDeleted(existing, 2);
    expect(result).toHaveLength(3);
  });

  it('元の配列・要素は変更しない（非破壊）', () => {
    markDeleted(existing, 1);
    expect(existing[0]?.deleted).toBeUndefined();
  });
});
