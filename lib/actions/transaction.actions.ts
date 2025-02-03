"use server";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { balances, category_totals, transactions } from "@/database/schema";
import { handleError, parseStringify } from "../utils";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { CategoryTotal } from "@/type";
import { after } from "next/server";
import { batchUpdateBudgetNotifications } from "./budgetNotification.actions";

export async function updateBalance({
  balanceId,
  amount,
  type,
  action,
  oldAmount,
}: {
  balanceId: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  action: "create" | "delete" | "update";
  oldAmount?: number;
}) {
  try {
    const balance = await db
      .select()
      .from(balances)
      .where(eq(balances.id, balanceId))
      .limit(1);

    if (balance.length === 0)
      return parseStringify({
        success: false,
        message: `${balanceId} was not found in the system!`,
      });

    // Prepare updated balance fields
    let currentBalance = parseFloat(balance[0].current_balance);
    let totalIncome = parseFloat(balance[0].total_income);
    let totalExpense = parseFloat(balance[0].total_expense);

    if (action === "create") {
      currentBalance += type === "INCOME" ? amount : -amount;
      if (type === "INCOME") totalIncome += amount;
      if (type === "EXPENSE") totalExpense += amount;
    } else if (action === "delete") {
      currentBalance -= type === "INCOME" ? amount : -amount;
      if (type === "INCOME") totalIncome -= amount;
      if (type === "EXPENSE") totalExpense -= amount;
    } else if (action === "update" && oldAmount !== undefined) {
      // Revert the old transaction
      currentBalance -= type === "INCOME" ? oldAmount : -oldAmount;
      if (type === "INCOME") totalIncome -= oldAmount;
      if (type === "EXPENSE") totalExpense -= oldAmount;

      // Apply the new transaction
      currentBalance += type === "INCOME" ? amount : -amount;
      if (type === "INCOME") totalIncome += amount;
      if (type === "EXPENSE") totalExpense += amount;
    }

    const updatedBalanceData = {
      current_balance: currentBalance.toString(),
      total_income: totalIncome.toString(),
      total_expense: totalExpense.toString(),
    };

    await db
      .update(balances)
      .set(updatedBalanceData)
      .where(eq(balances.id, balanceId));

    return parseStringify({
      success: true,
    });
  } catch (e) {
    handleError(e, `Failed to update balance after ${action} Transaction`);
    return parseStringify({
      success: false,
      message: `Failed to update balance after ${action} Transaction`,
    });
  }
}

export async function updateCategoryTotals({
  balanceId,
  categoryId,
  amount,
  type,
  action,
  oldAmount,
}: {
  balanceId: string;
  categoryId: string;
  amount: number;
  type: "EXPENSE" | "INCOME";
  action: "create" | "delete" | "update";
  oldAmount?: number;
}) {
  try {
    let categoryTotal: CategoryTotal;

    if (action === "create") {
      categoryTotal = (
        await db
          .insert(category_totals)
          .values({
            category_id: categoryId,
            balance_id: balanceId,
            total: "0",
            type,
          })
          .returning()
      )[0];
    } else {
      categoryTotal = (
        await db
          .select()
          .from(category_totals)
          .where(
            and(
              eq(category_totals.balance_id, balanceId),
              eq(category_totals.category_id, categoryId)
            )
          )
          .limit(1)
      )[0];
    }

    let totalAmount = parseFloat(categoryTotal.total);

    if (action === "create") {
      totalAmount += amount;
    } else if (action === "delete") {
      totalAmount -= amount;
    } else if (action === "update" && oldAmount !== undefined) {
      totalAmount += amount - oldAmount;
    }

    await db
      .update(category_totals)
      .set({
        total: totalAmount.toString(),
      })
      .where(eq(category_totals.id, categoryTotal.id));

    return parseStringify({
      success: true,
    });
  } catch (e) {
    handleError(e, "Failed to update category totals!");
    return parseStringify({
      success: false,
      message: "Failed to update category totals!",
    });
  }
}

export async function getTransactions({
  balanceId,
  type,
  limit = 10,
  offset = 0,
}: {
  balanceId: string;
  type: "INCOME" | "EXPENSE" | "ALL";
  limit?: number;
  offset?: number;
}) {
  try {
    const transactionsList = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.balance_id, balanceId),
          type === "ALL" ? undefined : eq(transactions.type, type)
        )
      )
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset);

    return parseStringify({
      success: true,
      message: `Successfully retrieve ${transactionsList.length} transactions!`,
      transactions: transactionsList,
    });
  } catch (e) {
    handleError(e, "Failed to fetch Transactions!");
    return parseStringify({
      success: false,
      message: "Failed to fetch Transactions!",
    });
  }
}

export async function getExpensesByDate({
  balanceId,
  startDate,
  endDate,
  categoryId,
}: {
  balanceId: string;
  startDate: Date;
  endDate?: Date;
  categoryId?: string;
}) {
  try {
    const expenses = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.balance_id, balanceId),
          eq(transactions.type, "EXPENSE"),
          gte(transactions.date, startDate),
          endDate ? lte(transactions.date, endDate) : undefined,
          categoryId ? eq(transactions.category_id, categoryId) : undefined
        )
      )
      .orderBy(desc(transactions.date));

    return parseStringify({
      success: true,
      message: "",
      expenses,
    });
  } catch (e) {
    handleError(e, "Failed to fetch expenses");
    return parseStringify({
      success: false,
      message: "Failed to fetch expenses",
    });
  }
}

export async function createTransaction({
  amount,
  description,
  date,
  balanceId,
  categoryId,
  type,
}: {
  amount: number;
  description: string;
  date: Date;
  balanceId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) return;

    const transaction = await db
      .insert(transactions)
      .values({
        user_id: session.user.id,
        category_id: categoryId,
        balance_id: balanceId,
        amount: amount.toString(),
        type,
        note: description,
        date,
      })
      .returning();

    // Update balance and category totals
    after(async () => {
      await updateBalance({ balanceId, amount, type, action: "create" });
      await updateCategoryTotals({
        balanceId,
        categoryId,
        amount,
        type,
        action: "create",
      });

      await batchUpdateBudgetNotifications({ balanceId });
    });

    return parseStringify({
      success: true,
      message: `New Transaction was successfully created!`,
      transaction: transaction[0],
    });
  } catch (error) {
    handleError(error, `Failed to create new transaction!`);
    return parseStringify({
      success: false,
      message: `Failed to create new transaction!`,
    });
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const deletedTransaction = (
      await db
        .delete(transactions)
        .where(eq(transactions.id, transactionId))
        .returning()
    )[0];

    after(async () => {
      await updateBalance({
        balanceId: deletedTransaction.balance_id,
        amount: parseFloat(deletedTransaction.amount),
        type: deletedTransaction.type || "EXPENSE",
        action: "delete",
      });

      await updateCategoryTotals({
        balanceId: deletedTransaction.balance_id,
        categoryId: deletedTransaction.category_id || "",
        amount: parseFloat(deletedTransaction.amount),
        type: deletedTransaction.type,
        action: "delete",
      });

      await batchUpdateBudgetNotifications({
        balanceId: deletedTransaction.balance_id,
      });
    });

    return parseStringify({
      success: true,
      message: "Successfully delete transaction!",
      deletedTransaction: deletedTransaction,
    });
  } catch (e) {
    handleError(e, "Failed to delete transaction!");
    return parseStringify({
      success: false,
      message: "Failed to delete transaction!",
    });
  }
}

export async function updateTransaction({
  transactionId,
  newAmount,
  newDescription,
  newDate,
  newCategoryId,
}: {
  transactionId: string;
  newAmount: number;
  newDescription: string;
  newDate: Date;
  newCategoryId: string;
}) {
  try {
    const targetTransaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, transactionId))
      .limit(1);

    if (targetTransaction.length === 0)
      return parseStringify({
        success: false,
        message: "No transaction found!",
      });

    const updatedTransaction = await db
      .update(transactions)
      .set({
        amount: newAmount.toString(),
        note: newDescription,
        date: newDate,
        category_id: newCategoryId,
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    after(async () => {
      await updateBalance({
        balanceId: targetTransaction[0].balance_id,
        amount: parseFloat(targetTransaction[0].amount),
        type: targetTransaction[0].type || "EXPENSE",
        action: "delete",
      });

      await updateCategoryTotals({
        balanceId: targetTransaction[0].balance_id,
        categoryId: targetTransaction[0].category_id || "",
        amount: parseFloat(targetTransaction[0].amount),
        type: targetTransaction[0].type,
        action: "delete",
      });

      await updateBalance({
        balanceId: updatedTransaction[0].balance_id,
        amount: newAmount,
        type: updatedTransaction[0].type || "EXPENSE",
        action: "create",
      });

      await updateCategoryTotals({
        balanceId: updatedTransaction[0].balance_id,
        categoryId: updatedTransaction[0].category_id || "",
        amount: newAmount,
        type: updatedTransaction[0].type,
        action: "create",
      });

      await batchUpdateBudgetNotifications({
        balanceId: updatedTransaction[0].balance_id,
      });
    });

    return parseStringify({
      message: "Successfully update transaction!",
      success: true,
      updatedTransaction: updatedTransaction[0],
    });
  } catch (e) {
    handleError(e, "Failed to update transaction!");
    return parseStringify({
      success: false,
      message: "Failed to update transaction!",
    });
  }
}
