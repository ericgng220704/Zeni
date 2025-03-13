import {
  pgTable,
  text,
  uuid,
  timestamp,
  pgEnum,
  decimal,
  date,
  integer,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const CATEGORY_TYPE_ENUM = pgEnum("category_type", [
  "EXPENSE",
  "INCOME",
]);

export const INVITATION_STATUS_ENUM = pgEnum("invitation_status_type", [
  "PENDING",
  "DECLINED",
  "ACCEPTED",
]);

export const NOTIFICATION_STATUS_ENUM = pgEnum("notification_status_type", [
  "READ",
  "UNREAD",
]);

export const BUDGET_NOTI_STATUS_ENUM = pgEnum("budget_noti_status_type", [
  "ALERT",
  "WARNING",
  "SAFE",
]);

export const BUDGET_STATUS_ENUM = pgEnum("budget_status", [
  "ACTIVE",
  "EXPIRED",
  "CANCELED",
]);

export const BUDGET_TYPE_ENUM = pgEnum("budget_type", [
  "MONTHLY",
  "CATEGORY",
  "CUSTOM",
]);

export const BALANCE_ROLE_ENUM = pgEnum("balance_role_type", [
  "OWNER",
  "MEMBER",
]);

export const RECURRING_TRANSACTION_STATUS = pgEnum(
  "recurring_transaction_status",
  ["ACTIVE", "CANCELED"]
);

export const FORECAST_PERIOD_TYPE = pgEnum("forecast_period_type", [
  "WEEK",
  "MONTH",
]);

export const ACTIVITY_ACTION_ENUM = pgEnum("activity_action", [
  // Balance actions
  "BALANCE_CREATE",
  "BALANCE_UPDATE",
  "BALANCE_DELETE",
  // Transaction actions
  "TRANSACTION_CREATE",
  "TRANSACTION_UPDATE",
  "TRANSACTION_DELETE",
  // Budget actions
  "BUDGET_CREATE",
  "BUDGET_UPDATE",
  "BUDGET_DELETE",
  // Recurring transaction actions
  "RECURRING_TRANSACTION_CREATE",
  "RECURRING_TRANSACTION_UPDATE",
  "RECURRING_TRANSACTION_DELETE",
  // Special cases
  "USER_UPDATE", // Only update allowed for user
  "INVITATION_SENT", // For invitation actions
  "CHATBOT_USAGE", // For chatbot usage tracking
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  color: text("color"),
  chatbotLimit: decimal("chatbot_limit").default("100"),
  isNewUser: boolean("is_new_user").default(true),
  defaultBalance: text("default_balance"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

export const balances = pgTable("balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  current_balance: decimal("current_balance").notNull(),
  total_income: decimal("total_income").notNull(),
  total_expense: decimal("total_expense").notNull(),
  is_forecasting_enabled: boolean("is_forecasting_enabled").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const user_balances = pgTable("user_balances", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, { onDelete: "cascade" }),
  role: BALANCE_ROLE_ENUM("role").default("MEMBER").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey().unique().notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  type: CATEGORY_TYPE_ENUM("type"),
  color: text("color"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category_id: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, {
      onDelete: "cascade",
    }),
  amount: decimal("amount").notNull(),
  type: CATEGORY_TYPE_ENUM("type").default("EXPENSE").notNull(),
  is_recurring: boolean("is_recurring").default(false).notNull(),
  note: text("note"),
  date: timestamp("date").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const recurring_transactions = pgTable("recurring_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  category_id: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, {
      onDelete: "cascade",
    }),
  amount: decimal("amount").notNull(),
  type: CATEGORY_TYPE_ENUM("type").default("EXPENSE").notNull(),
  note: text("note"),
  date: timestamp("date").notNull(),
  interval: decimal("interval").notNull(),
  status: RECURRING_TRANSACTION_STATUS("status").default("ACTIVE"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const category_totals = pgTable("category_totals", {
  id: uuid("id").defaultRandom().primaryKey(),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, { onDelete: "cascade" }),
  total: decimal("total").notNull(),
  type: CATEGORY_TYPE_ENUM("type").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, { onDelete: "cascade" }),
  target_id: uuid("target_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  inviter_id: uuid("inviter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  status: INVITATION_STATUS_ENUM("status").default("PENDING"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type"),
  subject_line: text("subject_line").notNull(),
  message: text("message").notNull(),
  status: NOTIFICATION_STATUS_ENUM("status").default("UNREAD"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, { onDelete: "cascade" }),
  category_id: uuid("category_id").references(() => categories.id),
  type: BUDGET_TYPE_ENUM("type").notNull(),
  name: text("name"),
  amount: decimal("amount").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date"),
  month: integer("month"),
  status: BUDGET_STATUS_ENUM("status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const budget_notifications = pgTable("budget_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  budget_id: uuid("budget_id")
    .notNull()
    .references(() => budgets.id, { onDelete: "cascade" }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, { onDelete: "cascade" }),
  total_expense: decimal("total_expense"),
  bar_color: text("bar_color"),
  gap: decimal("gap"),
  status: BUDGET_NOTI_STATUS_ENUM("status").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const activity_logs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance_id: uuid("balance_id").references(() => balances.id, {
    onDelete: "cascade",
  }),
  action: ACTIVITY_ACTION_ENUM("action").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const forecasts = pgTable("forecasts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, {
      onDelete: "cascade",
    }),
  period_type: FORECAST_PERIOD_TYPE("period_type").notNull(),
  forecast_start: timestamp("forecast_start").notNull(),
  forecast_end: timestamp("forecast_end").notNull(),
  forecast_income: decimal("forecast_income").default("0").notNull(),
  forecast_expense: decimal("forecast_expense").default("0").notNull(),
  forecast_net: decimal("forecast_net").default("0").notNull(),
  computed_at: timestamp("computed_at").defaultNow().notNull(),
});

export const personal_tips = pgTable("personal_tips", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  balance_id: uuid("balance_id")
    .notNull()
    .references(() => balances.id, {
      onDelete: "cascade",
    }),
  forecast_id: uuid("forecast_id")
    .notNull()
    .references(() => forecasts.id, { onDelete: "cascade" }),
  // store the tips array as a JSON string
  tips_json: text("tips_json"),
  summarized_analysis: text("summarized_analysis"),
  detailed_analysis: text("detailed_analysis"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
