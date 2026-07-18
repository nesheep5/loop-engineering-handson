import { describe, expect, it } from 'vitest';
import {
  filterActive,
  filterByMonth,
  isOverBudget,
  monthlyTotal,
  remainingBudget,
  topCategories,
  totalByCategory,
  unbudgetedCategories
} from '../src/summary';
import type { Expense } from '../src/types';

const expenses: Expense[] = [
  { id: 1, date: '2026-06-30', category: '食費', amount: 800 },
  { id: 2, date: '2026-07-01', category: '食費', amount: 1200, memo: 'スーパー' },
  { id: 3, date: '2026-07-15', category: '交通費', amount: 460 },
  { id: 4, date: '2026-07-31', category: '食費', amount: 3000, memo: '外食' },
  { id: 5, date: '2026-08-01', category: '娯楽', amount: 1500 }
];

describe('filterActive', () => {
  const withDeleted: Expense[] = [
    { id: 1, date: '2026-07-01', category: '食費', amount: 1200 },
    { id: 2, date: '2026-07-02', category: '交通費', amount: 460, deleted: true },
    { id: 3, date: '2026-07-03', category: '娯楽', amount: 800, deleted: false }
  ];

  it('deleted:true のレコードを除外する', () => {
    expect(filterActive(withDeleted).map((e) => e.id)).toEqual([1, 3]);
  });

  it('deleted 未指定・false のレコードは残す', () => {
    const result = filterActive(withDeleted);
    expect(result.some((e) => e.id === 1)).toBe(true);
    expect(result.some((e) => e.id === 3)).toBe(true);
  });

  it('元の配列は変更しない', () => {
    filterActive(withDeleted);
    expect(withDeleted).toHaveLength(3);
  });
});

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

describe('topCategories', () => {
  const ranked: Expense[] = [
    { id: 1, date: '2026-07-01', category: '食費', amount: 3000 },
    { id: 2, date: '2026-07-02', category: '交通費', amount: 1000 },
    { id: 3, date: '2026-07-03', category: '娯楽', amount: 2000 },
    { id: 4, date: '2026-07-04', category: '日用品', amount: 500 }
  ];

  it('金額の大きい順に上位 limit 件を返す', () => {
    expect(topCategories(ranked, 3)).toEqual([
      { category: '食費', total: 3000 },
      { category: '娯楽', total: 2000 },
      { category: '交通費', total: 1000 }
    ]);
  });

  it('同一カテゴリの支出は合算してから順位付けする', () => {
    const withDup: Expense[] = [
      { id: 1, date: '2026-07-01', category: '食費', amount: 1200 },
      { id: 2, date: '2026-07-02', category: '食費', amount: 3000 },
      { id: 3, date: '2026-07-03', category: '交通費', amount: 460 }
    ];
    expect(topCategories(withDup, 3)).toEqual([
      { category: '食費', total: 4200 },
      { category: '交通費', total: 460 }
    ]);
  });

  it('カテゴリ数が limit 未満なら全件を返す', () => {
    const few: Expense[] = [
      { id: 1, date: '2026-07-01', category: '食費', amount: 1000 },
      { id: 2, date: '2026-07-02', category: '交通費', amount: 500 }
    ];
    expect(topCategories(few, 3)).toHaveLength(2);
  });

  it('同額の場合はカテゴリ名の照合順で安定させる（順序が決定的）', () => {
    const tie: Expense[] = [
      { id: 1, date: '2026-07-01', category: '娯楽', amount: 1000 },
      { id: 2, date: '2026-07-02', category: '交通費', amount: 1000 }
    ];
    // 入力順に依存せず常に同じ順序（localeCompare 昇順）で返ることを確認する
    const expected = ['娯楽', '交通費'];
    expect(topCategories(tie, 3).map((r) => r.category)).toEqual(expected);
    const reversed: Expense[] = [tie[1]!, tie[0]!];
    expect(topCategories(reversed, 3).map((r) => r.category)).toEqual(expected);
  });

  it('空配列なら空配列を返す', () => {
    expect(topCategories([], 3)).toEqual([]);
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

describe('unbudgetedCategories', () => {
  const withUnbudgeted: Expense[] = [
    { id: 1, date: '2026-07-01', category: '食費', amount: 1200 },
    { id: 2, date: '2026-07-02', category: '交際費', amount: 3000 },
    { id: 3, date: '2026-07-03', category: '医療費', amount: 500 },
    { id: 4, date: '2026-07-04', category: '交際費', amount: 2000 }
  ];

  it('予算未設定で支出のあるカテゴリを合算して返す（カテゴリ名昇順）', () => {
    expect(unbudgetedCategories(withUnbudgeted, ['食費'])).toEqual([
      { category: '医療費', total: 500 },
      { category: '交際費', total: 5000 }
    ]);
  });

  it('予算設定済みのカテゴリは含めない', () => {
    const result = unbudgetedCategories(withUnbudgeted, ['食費', '交際費']);
    expect(result.map((r) => r.category)).toEqual(['医療費']);
  });

  it('すべて予算設定済みなら空配列を返す', () => {
    expect(
      unbudgetedCategories(withUnbudgeted, ['食費', '交際費', '医療費'])
    ).toEqual([]);
  });

  it('カテゴリ名の昇順で安定した順序になる', () => {
    const result = unbudgetedCategories(withUnbudgeted, []);
    const sorted = [...result.map((r) => r.category)].sort((a, b) =>
      a.localeCompare(b)
    );
    expect(result.map((r) => r.category)).toEqual(sorted);
  });

  it('支出が空なら空配列を返す', () => {
    expect(unbudgetedCategories([], ['食費'])).toEqual([]);
  });
});
