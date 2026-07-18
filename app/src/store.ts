// 支出データの読み書き（JSONファイル永続化）
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import type { Expense } from './types';

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

/** 新しい支出を追加した配列を返す。IDは既存の最大値+1（空なら1） */
export function addExpense(
  expenses: Expense[],
  input: Omit<Expense, 'id'>
): Expense[] {
  const nextId = expenses.reduce((max, e) => Math.max(max, e.id), 0) + 1;
  return [...expenses, { id: nextId, ...input }];
}
