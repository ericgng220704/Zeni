export interface User {
  id: string;
  name: string;
  email: string | null;
  emailVerified: Date | null;
  image: string;
  color: string;
  created_at: Date;
}
export interface Balance {
  id: string;
  name: string;
  current_balance: string;
  total_income: string;
  total_expense: string;
  created_at: Date;
}
export interface UserBalance {
  id: string;
  user_id: string;
  balance_id: string;
  role: "OWNER" | "MEMBER";
  created_at: Date;
}
export interface Category {
  id: string;
  name: string;
  icon: string;
  type: "EXPENSE" | "INCOME";
  color: string;
  created_at: Date;
}
export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  balance_id: string;
  amount: string;
  type: "EXPENSE" | "INCOME";
  note: string | null;
  date: Date;
  created_at: Date;
}
export interface CategoryTotal {
  id: string;
  category_id: string;
  balance_id: string;
  total: string;
  type: "EXPENSE" | "INCOME";
  created_at: Date;
}
export interface Invitation {
  id: string;
  balance_id: string;
  target_id: string;
  inviter_id: string;
  email: string;
  status: "PENDING" | "DECLINED" | "ACCEPTED";
  created_at: Date;
}
export interface Notification {
  id: string;
  user_id: string;
  type: string | null;
  subject_line: string;
  message: string;
  status: "READ" | "UNREAD";
  created_at: Date;
}
export interface Budget {
  id: string;
  balance_id: string;
  category_id: string | null;
  name: string | null;
  type: "MONTHLY" | "CATEGORY" | "CUSTOM";
  amount: string;
  start_date: Date;
  end_date: Date | null;
  month: number | null;
  status: "ACTIVE" | "EXPIRED" | "CANCELED";
  created_at: Date;
}
export interface BudgetInsert {
  balance_id: string;
  category_id: string | null;
  name: string | null;
  type: "MONTHLY" | "CATEGORY" | "CUSTOM";
  amount: string;
  start_date: string;
  end_date: string | null;
  month: number | null;
  status: "ACTIVE" | "EXPIRED" | "CANCELED";
}

export interface BudgetNotification {
  id: string;
  budget_id: string;
  balance_id: string;
  total_expense: string | null;
  bar_color: string | null;
  gap: string | null;
  status: "ALERT" | "WARNING" | "SAFE";
  created_at: Date;
}

export type BudgetNotiStatus = "ALERT" | "WARNING" | "SAFE";

export type BudgetWithNotification = {
  budgetId: string;
  balanceId: string;
  categoryId: string | null;
  type: "MONTHLY" | "CATEGORY" | "CUSTOM" | null;
  name: string | null;
  amount: number;
  startDate: string;
  endDate: string | null;
  month: number | null;
  budgetStatus: "ACTIVE" | "EXPIRED" | "CANCELED" | null;
  budgetCreatedAt: Date;
  notificationId: string | null;
  totalExpense: number;
  barColor: string | null;
  gap: number;
  notificationStatus: "ALERT" | "WARNING" | "SAFE";
  notificationCreatedAt: Date | null;
};
