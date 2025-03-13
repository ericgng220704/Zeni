"use server";

import { recurring_transactions } from "@/database/schema";
import { handleError, parseStringify } from "../utils";
import { db } from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { after } from "next/server";
import { logActivity } from "./activityLog.actions";

export async function createRecurringTransaction({
  amount,
  description,
  date,
  balanceId,
  categoryId,
  type,
  recurrenceInterval,
  userId,
}: {
  amount: number;
  description: string;
  date: Date;
  balanceId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  recurrenceInterval: number;
  userId: string;
}) {
  try {
    const recurringTransaction = await db
      .insert(recurring_transactions)
      .values({
        user_id: userId,
        amount: amount.toString(),
        note: description,
        date,
        balance_id: balanceId,
        category_id: categoryId,
        type,
        interval: (recurrenceInterval * 24 * 60 * 60 * 1000).toString(),
        status: "ACTIVE",
      })
      .returning();

    after(async () => {
      await logActivity("RECURRING_TRANSACTION_CREATE", balanceId);
    });

    return parseStringify({
      success: true,
      message: `Successfully created the recurring transaction`,
      recurringTransaction: recurringTransaction[0],
    });
  } catch (e) {
    handleError(e, "Failed to create recurring transaction");
    return parseStringify({
      success: false,
      message: "Failed to create recurring transaction",
    });
  }
}

export async function getRecurringTransactions(balanceId: string) {
  try {
    const transactions = await db
      .select()
      .from(recurring_transactions)
      .where(eq(recurring_transactions.balance_id, balanceId));

    return parseStringify({
      success: true,
      transactions,
    });
  } catch (e) {
    handleError(e, "Failed to get recurring transactions");
    return parseStringify({
      success: false,
      message: "Failed to get recurring transactions",
    });
  }
}

export async function updateRecurringTransactionStatus({
  recurringTransactionId,
  status,
}: {
  recurringTransactionId: string;
  status: "ACTIVE" | "CANCELED";
}) {
  try {
    const updatedTransaction = await db
      .update(recurring_transactions)
      .set({
        status,
      })
      .where(eq(recurring_transactions.id, recurringTransactionId))
      .returning();

    after(async () => {
      await logActivity(
        "RECURRING_TRANSACTION_UPDATE",
        updatedTransaction[0].balance_id,
        `Set recurring transaction status to ${status}`
      );
    });

    return parseStringify({
      success: true,
      updatedTransaction: updatedTransaction[0],
    });
  } catch (e) {
    handleError(e, "Failed to update recurring transaction status");
    return parseStringify({
      success: false,
      message: "Failed to update recurring transaction status",
    });
  }
}

export async function updateRecurringTransactionDate({
  recurringTransactionId,
  nextExecuteDate,
}: {
  recurringTransactionId: string;
  nextExecuteDate: Date;
}) {
  try {
    const updatedTransaction = await db
      .update(recurring_transactions)
      .set({
        date: nextExecuteDate,
      })
      .where(eq(recurring_transactions.id, recurringTransactionId))
      .returning();

    after(async () => {
      await logActivity(
        "RECURRING_TRANSACTION_UPDATE",
        updatedTransaction[0].balance_id,
        `Set recurring transaction date to ${nextExecuteDate}`
      );
    });

    return parseStringify({
      success: true,
      updatedTransaction: updatedTransaction[0],
    });
  } catch (e) {
    handleError(e, "Failed to update recurring transaction status");
    return parseStringify({
      success: false,
      message: "Failed to update recurring transaction status",
    });
  }
}

export async function deleteRecurringTransaction(transactionId: string) {
  try {
    const deletedTransaction = await db
      .delete(recurring_transactions)
      .where(eq(recurring_transactions.id, transactionId))
      .returning();

    after(async () => {
      await logActivity(
        "RECURRING_TRANSACTION_DELETE",
        deletedTransaction[0].balance_id
      );
    });

    return parseStringify({
      success: true,
      deletedTransaction: deletedTransaction[0],
    });
  } catch (e) {
    handleError(e, "Failed to delete transaction");
    return parseStringify({
      success: false,
      message: "Failed to delete transaction",
    });
  }
}
