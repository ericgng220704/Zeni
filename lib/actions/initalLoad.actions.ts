"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import {
  balances,
  categories,
  forecasts,
  personal_tips,
  recurring_transactions,
  transactions,
  user_balances,
  users,
} from "@/database/schema";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getBudgetsWithNotifications } from "./budgetNotification.actions";
import { getUserByEmail } from "./user.actions";

export async function loadTransactionPage({
  categoryType,
}: {
  categoryType: string;
}) {
  try {
    const session = await auth();

    if (!session?.user) return;

    const balancesList = await db
      .select({
        id: balances.id,
        name: balances.name,
        current_balance: balances.current_balance,
        total_income: balances.total_income,
        total_expense: balances.total_expense,
        created_at: balances.created_at,
      })
      .from(user_balances)
      .innerJoin(balances, eq(user_balances.balance_id, balances.id))
      .where(eq(user_balances.user_id, `${session.user.id}`));

    const categoriesList = await db
      .select()
      .from(categories)
      .where(
        eq(categories.type, categoryType === "expense" ? "EXPENSE" : "INCOME")
      );

    return parseStringify({
      success: true,
      balances: balancesList,
      categories: categoriesList,
      user: session.user,
    });
  } catch (e) {
    handleError(e, "Failed to load Transaction Page");
    return parseStringify({
      success: false,
      message: "Failed to load Transaction Page",
    });
  }
}

export async function loadBalanceDetailPage({
  balanceId,
  type,
}: {
  balanceId: string;
  type: "EXPENSE" | "INCOME" | "ALL";
}) {
  try {
    const balance = await db
      .select()
      .from(balances)
      .where(eq(balances.id, balanceId));

    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.balance_id, balanceId),
          type === "ALL" ? undefined : eq(transactions.type, type)
        )
      )
      .orderBy(desc(transactions.date))
      .limit(5)
      .offset(0);

    const userMembers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        color: users.color,
        role: user_balances.role,
        joinedAt: user_balances.created_at,
      })
      .from(user_balances)
      .innerJoin(users, eq(user_balances.user_id, users.id))
      .where(eq(user_balances.balance_id, balanceId));

    const categoriesList = await db.select().from(categories);
    const recurringTransactionList = await db
      .select()
      .from(recurring_transactions)
      .where(eq(recurring_transactions.balance_id, balanceId));

    return parseStringify({
      success: true,
      message: "",
      balance,
      recentTransactions,
      userMembers,
      categoriesList,
      recurringTransactionList,
    });
  } catch (e) {
    handleError(e, "Failed to load Balance Detail Page");
    return parseStringify({
      success: false,
      message: "Failed to load Balance Detail Page",
    });
  }
}

export async function loadAnalysisTab(balanceId: string) {
  try {
    const forecast = (
      await db
        .select()
        .from(forecasts)
        .where(and(eq(forecasts.balance_id, balanceId)))
        .orderBy(desc(forecasts.computed_at))
        .limit(1)
    )[0];

    const personalTip = (
      await db
        .select()
        .from(personal_tips)
        .where(eq(personal_tips.balance_id, balanceId))
    )[0];

    return parseStringify({
      success: true,
      message: "",
      forecast,
      personalTip,
    });
  } catch (e) {
    handleError(e, "Failed to load Analysis");
    return parseStringify({
      success: false,
      message: "Failed to load Analysis",
    });
  }
}
