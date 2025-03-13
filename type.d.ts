export interface User {
  id: string;
  name: string;
  email: string | null;
  emailVerified: Date | null;
  image: string;
  color: string;
  chatbot_limit: string;

  default_balance: string;
  created_at: Date;
}

export interface RecurringTransaction {
  id: string;
  user_id: string;
  category_id: string;
  balance_id: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  note: string;
  date: Date;
  interval: string;
  status: "ACTIVE" | "CANCELED";
  created_at: Date;
}

export interface UserMember {
  id: string;
  email: string | null;
  name: string;
  image: string | null;
  color: string | null;
  role: "OWNER" | "MEMBER";
  joinedAt: Date;
}
export interface Balance {
  id: string;
  name: string;
  current_balance: string;
  total_income: string;
  total_expense: string;
  is_forecasting_enabled: boolean;
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

export type ActivityLog = {
  id: string;
  user_id: string;
  balance_id: string;
  action: ActivityLogActions;
  description: string;
  created_at: Date;
};

export type ActivityLogActions =
  | "BALANCE_CREATE"
  | "BALANCE_UPDATE"
  | "BALANCE_DELETE"
  // Transaction actions
  | "TRANSACTION_CREATE"
  | "TRANSACTION_UPDATE"
  | "TRANSACTION_DELETE"
  // Budget actions
  | "BUDGET_CREATE"
  | "BUDGET_UPDATE"
  | "BUDGET_DELETE"
  // Recurring transaction actions
  | "RECURRING_TRANSACTION_CREATE"
  | "RECURRING_TRANSACTION_UPDATE"
  | "RECURRING_TRANSACTION_DELETE"
  // Special cases
  | "USER_UPDATE" // Only update allowed for user
  | "INVITATION_SENT" // For invitation actions
  | "CHATBOT_USAGE";

export type Forecast = {
  id: string;
  user_id: string;
  balance_id: string;
  period_type: "WEEK" | "MONTH";
  forecast_start: Date;
  forecast_end: Date;
  forecast_income: string;
  forecast_expense: string;
  forecast_net: string;
  computed_at: Date;
};

export type PersonalTips = {
  id: string;
  user_id: string;
  balance_id: string;
  forecast_id: string;
  // Stored as a JSON string representing an array of strings (e.g., ["tip1", "tip2", "tip3"])
  tips_json?: string | null;
  // A short summary of the analysis (optional)
  summarized_analysis?: string | null;
  // A detailed explanation of the user’s financial situation (optional)
  detailed_analysis?: string | null;
  created_at: Date;
};
