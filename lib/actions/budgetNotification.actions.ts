"use server";

import { db } from "@/database/drizzle";
import { budgets, budget_notifications } from "@/database/schema";
import { handleError, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getExpensesByDate } from "./transaction.actions";
import { BudgetNotiStatus, Transaction } from "@/type";

// Updates (or creates) a single budget notification
export async function updateBudgetNotification({
  budgetId,
  balanceId,
  budgetNotificationId,
  categoryId,
}: {
  budgetNotificationId?: string;
  categoryId?: string;
  budgetId: string;
  balanceId: string;
}) {
  try {
    let notiRecord: any;

    if (!budgetNotificationId) {
      // Insert a new notification record.
      const newNoti = await db
        .insert(budget_notifications)
        .values({
          budget_id: budgetId,
          balance_id: balanceId,
          total_expense: "0",
          bar_color: "#51cf66",
          gap: "0",
          status: "SAFE",
        })
        .returning();
      notiRecord = newNoti[0];
    } else {
      // Fetch existing notification by its id.
      const notiRecords = await db
        .select()
        .from(budget_notifications)
        .where(eq(budget_notifications.id, budgetNotificationId));
      notiRecord = notiRecords[0];
    }

    // Fetch the associated budget record.
    const budgetRecords = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, budgetId));
    const budget = budgetRecords[0];

    const budgetStartDate = new Date(budget.start_date);
    const budgetEndDate = budget.end_date ? new Date(budget.end_date) : null;

    const { expenses } = await getExpensesByDate({
      balanceId,
      startDate: budgetStartDate,
      endDate: budgetEndDate || undefined,
      categoryId,
    });

    let totalExpense = 0;
    let gap = 0;
    if (expenses && expenses.length > 0) {
      totalExpense = expenses.reduce(
        (total: any, transaction: Transaction) =>
          total + parseFloat(transaction.amount),
        0
      );
      gap = Math.abs(Number(budget.amount) - totalExpense);
    } else {
      totalExpense = 0;
      gap = Number(budget.amount);
    }

    let status: BudgetNotiStatus;
    let barColor: string;
    if (totalExpense > Number(budget.amount)) {
      status = "ALERT";
      barColor = "#ff6b6b";
    } else if (totalExpense < Number(budget.amount) && gap < 1000) {
      status = "WARNING";
      barColor = "#ffe066";
    } else {
      status = "SAFE";
      barColor = "#51cf66";
    }

    // Update the notification record.
    const updatedNotiArr = await db
      .update(budget_notifications)
      .set({
        total_expense: totalExpense.toString(),
        bar_color: barColor,
        gap: gap.toString(),
        status: status,
      })
      .where(eq(budget_notifications.id, notiRecord.id))
      .returning();
    const updatedNoti = updatedNotiArr[0];

    revalidatePath("/budgets");
    return parseStringify({
      success: true,
      message: "",
      updatedNoti,
    });
  } catch (e) {
    handleError(e, "failed to update budget notification");
    return parseStringify({
      success: false,
      message: "failed to update budget notification",
    });
  }
}

function calculateExpensesForBudget(
  budget: {
    start_date: string;
    end_date: string | null;
    amount: string;
    type: "CATEGORY" | "MONTHLY" | "CUSTOM";
    category_id?: string | null;
  },
  transactions: { date: string; amount: string; categoryId?: string }[]
): number {
  const budgetStartDate = new Date(budget.start_date);
  const budgetEndDate = budget.end_date ? new Date(budget.end_date) : null;
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    if (budget.type === "CATEGORY") {
      return (
        transactionDate >= budgetStartDate &&
        (!budgetEndDate || transactionDate <= budgetEndDate) &&
        transaction.categoryId === budget.category_id
      );
    }
    // For monthly and custom budgets, just filter by date.
    if (budget.type === "MONTHLY" || budget.type === "CUSTOM") {
      return (
        transactionDate >= budgetStartDate &&
        (!budgetEndDate || transactionDate <= budgetEndDate)
      );
    }
    return false;
  });
  return filteredTransactions.reduce(
    (total, t) => total + parseFloat(t.amount),
    0
  );
}

// Batch update notifications for a given balance.
export async function batchUpdateBudgetNotifications({
  balanceId,
}: {
  balanceId: string;
}) {
  try {
    // Fetch active notifications by joining with budgets.
    const activeRecords = await db
      .select({
        noti: budget_notifications,
        budget: budgets,
      })
      .from(budget_notifications)
      .innerJoin(budgets, eq(budgets.id, budget_notifications.budget_id))
      .where(
        and(
          eq(budget_notifications.balance_id, balanceId),
          eq(budgets.status, "ACTIVE")
        )
      );

    let earliestStartDate: Date | null = null;
    let finalLatestEndDate: Date | null = null;

    if (activeRecords.length > 0) {
      // Determine the earliest start date among active budgets.
      earliestStartDate = activeRecords.reduce((earliest: Date | null, rec) => {
        const start = new Date(rec.budget.start_date);
        if (!earliest || start < earliest) return start;
        return earliest;
      }, null);

      // Determine the latest end date among active budgets (if any budget has an end date).
      finalLatestEndDate = activeRecords.reduce((latest: Date | null, rec) => {
        if (!rec.budget.end_date) return latest;
        const end = new Date(rec.budget.end_date);
        if (!latest || end > latest) return end;
        return latest;
      }, null);
    }
    // Fetch expenses over the overall period.
    const { expenses } = await getExpensesByDate({
      balanceId,
      startDate: earliestStartDate || new Date(),
      endDate: finalLatestEndDate || undefined,
    });

    // Update each active notification.
    const updatePromises = activeRecords.map(async (rec) => {
      const budget = rec.budget;
      const totalExpense = calculateExpensesForBudget(budget, expenses);
      const gap = Math.abs(Number(budget.amount) - totalExpense);

      let status: BudgetNotiStatus;
      if (totalExpense > Number(budget.amount)) {
        status = "ALERT";
      } else if (totalExpense < Number(budget.amount) && gap < 1000) {
        status = "WARNING";
      } else {
        status = "SAFE";
      }

      await db
        .update(budget_notifications)
        .set({
          total_expense: totalExpense.toString(),
          bar_color:
            totalExpense > Number(budget.amount) ? "#ff6b6b" : "#51cf66",
          gap: gap.toString(),
          status: status,
        })
        .where(eq(budget_notifications.id, rec.noti.id));
    });

    await Promise.all(updatePromises);
  } catch (e) {
    handleError(e, "Failed to batch update budgets");
  }
}

export async function getBudgetsWithNotifications(balanceId: string) {
  try {
    const rawData = await db
      .select({
        budgetId: budgets.id,
        balanceId: budgets.balance_id,
        categoryId: budgets.category_id,
        type: budgets.type,
        name: budgets.name,
        amount: budgets.amount, // Will cast this to float later
        startDate: budgets.start_date,
        endDate: budgets.end_date,
        month: budgets.month,
        budgetStatus: budgets.status,
        budgetCreatedAt: budgets.created_at,
        notificationId: budget_notifications.id,
        totalExpense: budget_notifications.total_expense,
        barColor: budget_notifications.bar_color,
        gap: budget_notifications.gap,
        notificationStatus: budget_notifications.status,
        notificationCreatedAt: budget_notifications.created_at,
      })
      .from(budgets)
      .leftJoin(
        budget_notifications,
        eq(budgets.id, budget_notifications.budget_id)
      )
      .where(eq(budgets.balance_id, balanceId));

    const data = rawData.map((record) => ({
      ...record,
      notificationStatus: record.notificationStatus || "SAFE",
      amount: parseFloat(record.amount),
      totalExpense: record.totalExpense ? parseFloat(record.totalExpense) : 0,
      gap: record.gap ? parseFloat(record.gap) : 0,
    }));

    return data;
  } catch (error) {
    console.error("Failed to fetch budgets with notifications:", error);
    throw new Error("Failed to fetch budgets with notifications");
  }
}
