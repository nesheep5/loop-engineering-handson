// 支出データの読み書き（JSONファイル永続化）
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Expense } from './types';

/**
 * 日付文字列が YYYY-MM-DD 形式かつ実在する日付か判定する。
 * 形式が違う・存在しない日付（例: 2026-02-30）は false を返す。
 */
export function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    return false;
  }
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1) {
    return false;
  }
  // 月ごとの日数（うるう年を考慮）で上限を判定する。
  // Date コンストラクタは年0〜99を1900年代に丸めるため setFullYear で明示設定する
  const lastDay = new Date(0);
  lastDay.setFullYear(year, month, 0);
  return day <= lastDay.getDate();
}

/** JSONファイルから支出一覧を読み込む。ファイルがなければ空配列を返す */
export function loadExpenses(filePath: string): Expense[] {
  if (!existsSync(filePath)) {
    return [];
  }
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Expense[];
}

/** 支出一覧をJSONファイルに保存する */
export function saveExpenses(filePath: string, expenses: Expense[]): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(expenses, null, 2) + '\n', 'utf-8');
}

/** 指定IDの支出を返す。存在しなければ undefined（削除済みかどうかは呼び出し側で判定する） */
export function findExpense(expenses: Expense[], id: number): Expense | undefined {
  return expenses.find((e) => e.id === id);
}

/** 指定IDの支出に deleted:true を付与した配列を返す（論理削除、非破壊） */
export function markDeleted(expenses: Expense[], id: number): Expense[] {
  return expenses.map((e) => (e.id === id ? { ...e, deleted: true } : e));
}

/** 新しい支出を追加した配列を返す。IDは既存の最大値+1（空なら1） */
export function addExpense(
  expenses: Expense[],
  input: Omit<Expense, 'id'>
): Expense[] {
  const nextId = expenses.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  return [...expenses, { id: nextId, ...input }];
}
