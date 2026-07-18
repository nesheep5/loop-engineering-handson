import { describe, expect, it } from 'vitest';
import { formatYen, formatExpenseRow, toCsv } from '../src/format';
import type { Expense } from '../src/types';

describe('formatYen', () => {
  it('3桁区切りと円記号を付けて整形する', () => {
    expect(formatYen(1234)).toBe('¥1,234');
  });

  it('4桁以上でも3桁ごとに区切る', () => {
    expect(formatYen(1000000)).toBe('¥1,000,000');
  });

  it('3桁以下は区切りを入れない', () => {
    expect(formatYen(460)).toBe('¥460');
  });

  it('0は「¥0」と表示する', () => {
    expect(formatYen(0)).toBe('¥0');
  });
});

describe('formatExpenseRow', () => {
  it('ID・日付・カテゴリ・金額・メモを1行に整形する', () => {
    const e: Expense = {
      id: 1,
      date: '2026-07-01',
      category: '食費',
      amount: 1200,
      memo: 'スーパー'
    };
    expect(formatExpenseRow(e)).toBe(
      '   1  2026-07-01  食費　　　　      ¥1,200  スーパー'
    );
  });

  it('メモが未指定の場合は空文字として扱う', () => {
    const e: Expense = {
      id: 42,
      date: '2026-07-15',
      category: '交通費',
      amount: 460
    };
    expect(formatExpenseRow(e)).toBe(
      '  42  2026-07-15  交通費　　　        ¥460  '
    );
  });

  it('日付は YYYY-MM-DD 形式のまま表示する', () => {
    const e: Expense = {
      id: 3,
      date: '2026-12-31',
      category: '娯楽',
      amount: 500
    };
    expect(formatExpenseRow(e)).toContain('2026-12-31');
  });
});

describe('toCsv', () => {
  it('ヘッダ行を id,date,category,amount,memo で出力する', () => {
    expect(toCsv([]).split('\n')[0]).toBe('id,date,category,amount,memo');
  });

  it('通常の支出を1行のCSVに変換する', () => {
    const e: Expense = {
      id: 1,
      date: '2026-07-01',
      category: '食費',
      amount: 1200,
      memo: 'スーパー'
    };
    expect(toCsv([e])).toBe(
      'id,date,category,amount,memo\n1,2026-07-01,食費,1200,スーパー'
    );
  });

  it('メモ未指定の場合は末尾を空フィールドにする', () => {
    const e: Expense = {
      id: 42,
      date: '2026-07-15',
      category: '交通費',
      amount: 460
    };
    expect(toCsv([e])).toBe(
      'id,date,category,amount,memo\n42,2026-07-15,交通費,460,'
    );
  });

  it('メモにカンマが含まれる場合はダブルクォートで囲む（列がずれない）', () => {
    const e: Expense = {
      id: 1,
      date: '2026-07-01',
      category: '食費',
      amount: 1200,
      memo: '牛乳,卵,パン'
    };
    const row = toCsv([e]).split('\n')[1];
    expect(row).toBe('1,2026-07-01,食費,1200,"牛乳,卵,パン"');
  });

  it('メモにダブルクォートが含まれる場合は "" にエスケープして囲む', () => {
    const e: Expense = {
      id: 1,
      date: '2026-07-01',
      category: '食費',
      amount: 500,
      memo: '"特売"の日'
    };
    const row = toCsv([e]).split('\n')[1];
    expect(row).toBe('1,2026-07-01,食費,500,"""特売""の日"');
  });

  it('メモに改行が含まれる場合はダブルクォートで囲む', () => {
    const e: Expense = {
      id: 1,
      date: '2026-07-01',
      category: '食費',
      amount: 500,
      memo: '1行目\n2行目'
    };
    const row = toCsv([e]).split('\n').slice(1).join('\n');
    expect(row).toBe('1,2026-07-01,食費,500,"1行目\n2行目"');
  });

  it('カンマを含むカテゴリもエスケープする', () => {
    const e: Expense = {
      id: 1,
      date: '2026-07-01',
      category: '食費,外食',
      amount: 500
    };
    const row = toCsv([e]).split('\n')[1];
    expect(row).toBe('1,2026-07-01,"食費,外食",500,');
  });
});
