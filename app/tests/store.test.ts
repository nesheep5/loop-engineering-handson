import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addExpense,
  findExpense,
  isValidDate,
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

describe('isValidDate', () => {
  it('YYYY-MM-DD 形式の実在する日付を受理する', () => {
    expect(isValidDate('2026-07-18')).toBe(true);
  });

  it('月末日（月による）も受理する', () => {
    expect(isValidDate('2026-01-31')).toBe(true);
    expect(isValidDate('2026-04-30')).toBe(true);
  });

  it('うるう年の2月29日を受理する', () => {
    expect(isValidDate('2024-02-29')).toBe(true);
  });

  it('平年の2月29日は受理しない', () => {
    expect(isValidDate('2026-02-29')).toBe(false);
  });

  it('存在しない日付は受理しない', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-04-31')).toBe(false);
  });

  it('月・日が範囲外なら受理しない', () => {
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('2026-00-10')).toBe(false);
    expect(isValidDate('2026-07-00')).toBe(false);
  });

  it('区切りや桁数が異なる形式は受理しない', () => {
    expect(isValidDate('2026/07/18')).toBe(false);
    expect(isValidDate('2026-7-1')).toBe(false);
    expect(isValidDate('20260718')).toBe(false);
  });

  it('前後に余分な文字がある場合は受理しない', () => {
    expect(isValidDate(' 2026-07-18')).toBe(false);
    expect(isValidDate('2026-07-18T00:00')).toBe(false);
  });

  it('空文字は受理しない', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('年が0〜99でも1900年代に丸めず正しく判定する', () => {
    // 0100年は平年なので2月29日は不可（1900年代への丸めが起きないことの確認）
    expect(isValidDate('0100-02-29')).toBe(false);
    // 0104年はうるう年なので2月29日は可
    expect(isValidDate('0104-02-29')).toBe(true);
  });
});
