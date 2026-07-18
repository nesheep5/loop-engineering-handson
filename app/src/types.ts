// 家計簿の基本データ型

/** 支出1件分の記録 */
export type Expense = {
  /** 連番のID（1始まり） */
  id: number;
  /** 支出日（YYYY-MM-DD 形式） */
  date: string;
  /** カテゴリ名（例: 食費、交通費） */
  category: string;
  /** 金額（円、正の整数） */
  amount: number;
  /** 任意のメモ */
  memo?: string;
  /** 論理削除フラグ（省略時は false とみなす） */
  deleted?: boolean;
};

/** カテゴリごとの月間予算 */
export type Budget = {
  category: string;
  /** 月間予算額（円） */
  monthlyLimit: number;
};
