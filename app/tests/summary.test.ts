import { describe, expect, it } from 'vitest';
import {
  filterByMonth,
  isOverBudget,
  monthlyTotal,
  remainingBudget,
  totalByCategory
} from '../src/summary';
import type { Expense } from '../src/types';

const expenses: Expense[] = [
  { id: 1, date: '2026-06-30', category: '食費', amount: 800 },
  { id: 2, date: '2026-07-01', category: '食費', amount: 1200, memo: 'スーパー' },
  { id: 3, date: '2026-07-15', category: '交通費', amount: 460 },
  { id: 4, date: '2026-07-31', category: '食費', amount: 3000, memo: '外食' },
  { id: 5, date: '2026-08-01', category: '娯楽', amount: 1500 }
];

describe('filterByMonth', () => {
  it('指定した月の支出だけを抽出する', () => {
    const result = filterByMonth(expenses, '2026-07');
    expect(result.map((e) => e.id)).toEqual([2, 3, 4]);
  });

  it('月初と月末の支出も含まれる', () => {
    const result = filterByMonth(expenses, '2026-07');
    expect(result.some((e) => e.date === '2026-07-01')).toBe(true);
    expect(result.some((e) => e.date === '2026-07-31')).toBe(true);
  });

  it('該当する支出がない月は空配列を返す', () => {
    expect(filterByMonth(expenses, '2026-01')).toEqual([]);
  });
});

describe('totalByCategory', () => {
  it('カテゴリごとに金額を合計する', () => {
    const result = totalByCategory(filterByMonth(expenses, '2026-07'));
    expect(result).toEqual({ 食費: 4200, 交通費: 460 });
  });

  it('空配列なら空オブジェクトを返す', () => {
    expect(totalByCategory([])).toEqual({});
  });
});

describe('monthlyTotal', () => {
  it('指定した月の合計支出額を求める', () => {
    expect(monthlyTotal(expenses, '2026-07')).toBe(4660);
  });

  it('支出がない月は合計0を返す', () => {
    expect(monthlyTotal(expenses, '2026-01')).toBe(0);
  });
});

describe('isOverBudget', () => {
  it('予算を超えていたら超過と判定する', () => {
    expect(isOverBudget(10001, 10000)).toBe(true);
  });

  it('予算より少なければ超過ではない', () => {
    expect(isOverBudget(9999, 10000)).toBe(false);
  });

  it('ちょうど予算額ぴったりは超過とみなさない', () => {
    expect(isOverBudget(10000, 10000)).toBe(false);
  });
});

describe('remainingBudget', () => {
  it('予算の残額を求める', () => {
    expect(remainingBudget(10000, 4200)).toBe(5800);
  });

  it('超過している場合は0を返す', () => {
    expect(remainingBudget(10000, 12000)).toBe(0);
  });
});
