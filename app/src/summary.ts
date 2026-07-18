// 支出の集計と予算チェック
import type { Expense } from './types';

/** 指定した月（YYYY-MM 形式）の支出だけを抽出する */
export function filterByMonth(expenses: Expense[], month: string): Expense[] {
  // 月末日は月によって 28〜31 日と異なるため、翌月1日未満で判定する
  const [year = 0, mon = 0] = month.split('-').map(Number);
  const nextMonth =
    mon === 12
      ? `${year + 1}-01`
      : `${year}-${String(mon + 1).padStart(2, '0')}`;
  return expenses.filter(
    (e) => e.date >= `${month}-01` && e.date < `${nextMonth}-01`
  );
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
  return filterByMonth(expenses, month)
    .map((e) => e.amount)
    .reduce((sum, amount) => sum + amount, 0);
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
