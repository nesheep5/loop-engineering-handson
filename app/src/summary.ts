// 支出の集計と予算チェック
import type { Expense } from './types';

/** 指定した月（YYYY-MM 形式）の支出だけを抽出する */
export function filterByMonth(expenses: Expense[], month: string): Expense[] {
  return expenses.filter((e) => e.date.slice(0, 7) === month);
}

/** カテゴリごとの合計金額を求める */
export function totalByCategory(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }
  return totals;
}

/** 指定した月の合計支出額を求める */
export function monthlyTotal(expenses: Expense[], month: string): number {
  return filterByMonth(expenses, month).reduce((sum, e) => sum + e.amount, 0);
}

/**
 * 予算を超過しているか判定する。
 * ちょうど予算額ぴったりの場合は超過とみなさない。
 */
export function isOverBudget(spent: number, limit: number): boolean {
  return spent > limit;
}

/** 予算の残額を求める（超過時は0） */
export function remainingBudget(limit: number, spent: number): number {
  return Math.max(0, limit - spent);
}
