// 表示用のフォーマット処理
import type { Expense } from './types';

/** 金額を「¥1,234」形式（3桁区切り）に整形する */
export function formatYen(amount: number): string {
  return '¥' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 支出1件を一覧表示用の1行に整形する */
export function formatExpenseRow(e: Expense): string {
  const memo = e.memo ?? '';
  return `${String(e.id).padStart(4)}  ${e.date}  ${e.category.padEnd(6, '　')}  ${formatYen(e.amount).padStart(10)}  ${memo}`;
}

/**
 * CSVの1フィールドを RFC 4180 準拠でエスケープする。
 * カンマ・改行・ダブルクォートを含む場合はダブルクォートで囲み、
 * 内部のダブルクォートは "" に二重化する。
 */
function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 支出一覧をCSV文字列に変換する（RFC 4180 準拠）。
 * ヘッダ行: id,date,category,amount,memo
 */
export function toCsv(expenses: Expense[]): string {
  const header = 'id,date,category,amount,memo';
  const rows = expenses.map((e) =>
    [
      String(e.id),
      e.date,
      e.category,
      String(e.amount),
      e.memo ?? ''
    ]
      .map(escapeCsvField)
      .join(',')
  );
  return [header, ...rows].join('\n');
}
