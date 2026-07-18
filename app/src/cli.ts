// kakeibo CLI エントリポイント
import { fileURLToPath } from 'node:url';
import { formatExpenseRow, formatYen, toCsv } from './format';
import {
  addExpense,
  findExpense,
  isValidDate,
  loadExpenses,
  markDeleted,
  saveExpenses
} from './store';
import {
  filterActive,
  filterByMonth,
  isOverBudget,
  monthlyTotal,
  remainingBudget,
  topCategories,
  totalByCategory,
  unbudgetedCategories
} from './summary';
import type { Budget } from './types';

const DATA_PATH = fileURLToPath(new URL('../data/expenses.json', import.meta.url));
const BUDGET_PATH = fileURLToPath(new URL('../data/budgets.json', import.meta.url));

function usage(): void {
  console.log(`kakeibo - ハンズオン教材の家計簿CLI

使い方:
  npm run kakeibo -- add <日付> <カテゴリ> <金額> [メモ]   支出を記録する
  npm run kakeibo -- delete <ID>                           支出を削除する
  npm run kakeibo -- list [YYYY-MM]                        支出を一覧表示する
  npm run kakeibo -- summary <YYYY-MM>                     月の集計を表示する
  npm run kakeibo -- top <YYYY-MM>                         月の支出上位3カテゴリを表示する
  npm run kakeibo -- budget <YYYY-MM>                      予算の消化状況を表示する
  npm run kakeibo -- export [YYYY-MM]                      CSV形式で出力する

例:
  npm run kakeibo -- add 2026-07-01 食費 1200 スーパーで買い物
  npm run kakeibo -- summary 2026-07`);
}

async function loadBudgets(): Promise<Budget[]> {
  const { readFileSync, existsSync } = await import('node:fs');
  if (!existsSync(BUDGET_PATH)) return [];
  return JSON.parse(readFileSync(BUDGET_PATH, 'utf-8')) as Budget[];
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  const expenses = loadExpenses(DATA_PATH);
  // list/summary/budget/export は論理削除済み（deleted:true）を除外して扱う
  const active = filterActive(expenses);

  switch (command) {
    case 'add': {
      const [date, category, amountStr, ...memoParts] = args;
      if (!date || !category || !amountStr) {
        console.error('エラー: add には 日付・カテゴリ・金額 が必要です');
        process.exitCode = 1;
        return;
      }
      if (!isValidDate(date)) {
        console.error('エラー: 日付は YYYY-MM-DD 形式で指定してください');
        process.exitCode = 1;
        return;
      }
      const amount = Number(amountStr);
      if (!Number.isInteger(amount) || amount <= 0) {
        console.error('エラー: 金額は正の整数で指定してください');
        process.exitCode = 1;
        return;
      }
      const memo = memoParts.length > 0 ? memoParts.join(' ') : undefined;
      const updated = addExpense(expenses, { date, category, amount, memo });
      saveExpenses(DATA_PATH, updated);
      const added = updated[updated.length - 1];
      console.log(`記録しました: ${formatExpenseRow(added!)}`);
      return;
    }
    case 'list': {
      const [month] = args;
      const target = month ? filterByMonth(active, month) : active;
      if (target.length === 0) {
        console.log('支出の記録がありません');
        return;
      }
      for (const e of target) {
        console.log(formatExpenseRow(e));
      }
      return;
    }
    case 'summary': {
      const [month] = args;
      if (!month) {
        console.error('エラー: summary には対象月（YYYY-MM）が必要です');
        process.exitCode = 1;
        return;
      }
      const monthly = filterByMonth(active, month);
      const totals = totalByCategory(monthly);
      console.log(`${month} の支出`);
      for (const [category, total] of Object.entries(totals)) {
        console.log(`  ${category.padEnd(6, '　')} ${formatYen(total).padStart(10)}`);
      }
      console.log(`  合計     ${formatYen(monthlyTotal(active, month)).padStart(10)}`);
      return;
    }
    case 'top': {
      const [month] = args;
      if (!month) {
        console.error('エラー: top には対象月（YYYY-MM）が必要です');
        process.exitCode = 1;
        return;
      }
      const ranking = topCategories(filterByMonth(active, month), 3);
      if (ranking.length === 0) {
        console.log(`${month} の支出はありません`);
        return;
      }
      console.log(`${month} の支出上位カテゴリ`);
      ranking.forEach((r, i) => {
        console.log(
          `  ${i + 1}. ${r.category.padEnd(6, '　')} ${formatYen(r.total).padStart(10)}`
        );
      });
      return;
    }
    case 'budget': {
      const [month] = args;
      if (!month) {
        console.error('エラー: budget には対象月（YYYY-MM）が必要です');
        process.exitCode = 1;
        return;
      }
      const budgets = await loadBudgets();
      const monthly = filterByMonth(active, month);
      const totals = totalByCategory(monthly);
      console.log(`${month} の予算消化状況`);
      for (const b of budgets) {
        const spent = totals[b.category] ?? 0;
        const status = isOverBudget(spent, b.monthlyLimit)
          ? `超過！ ${formatYen(spent - b.monthlyLimit)} オーバー`
          : `残り ${formatYen(remainingBudget(b.monthlyLimit, spent))}`;
        console.log(
          `  ${b.category.padEnd(6, '　')} ${formatYen(spent).padStart(10)} / ${formatYen(b.monthlyLimit).padStart(10)}  ${status}`
        );
      }
      // 予算未設定なのに支出があるカテゴリを末尾に表示する
      const unbudgeted = unbudgetedCategories(
        monthly,
        budgets.map((b) => b.category)
      );
      for (const u of unbudgeted) {
        console.log(
          `  ${u.category.padEnd(6, '　')} ${formatYen(u.total).padStart(10)}  予算未設定`
        );
      }
      return;
    }
    case 'export': {
      const [month] = args;
      const target = month ? filterByMonth(active, month) : active;
      console.log(toCsv(target));
      return;
    }
    case 'delete': {
      const [idStr] = args;
      const id = Number(idStr);
      if (!idStr || !Number.isInteger(id) || id <= 0) {
        console.error('エラー: delete には削除する支出のID（正の整数）が必要です');
        process.exitCode = 1;
        return;
      }
      const target = findExpense(expenses, id);
      if (!target) {
        console.error(`エラー: ID ${id} の支出は見つかりませんでした`);
        process.exitCode = 1;
        return;
      }
      if (target.deleted === true) {
        console.error(`エラー: ID ${id} の支出はすでに削除済みです`);
        process.exitCode = 1;
        return;
      }
      // 物理削除ではなく deleted:true を付与する論理削除
      saveExpenses(DATA_PATH, markDeleted(expenses, id));
      console.log(`削除しました: ID ${id}`);
      return;
    }
    default:
      usage();
  }
}

await main();
