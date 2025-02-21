"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { budget_notifications, budgets } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { Budget, BudgetInsert } from "@/type";
import { revalidatePath } from "next/cache";
import { updateBudgetNotification } from "./budgetNotification.actions";

export async function getBudgets({
  balanceId,
  type,
}: {
  balanceId: string;
  type?: "MONTHLY" | "CATEGORY" | "CUSTOM";
}) {
  try {
    const budgetsList = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.balance_id, balanceId),
          type ? eq(budgets.type, type) : undefined
        )
      );

    return parseStringify({
      success: true,
      message: "",
      budgets: budgetsList,
    });
  } catch (e) {
    handleError(e, "Failed to get budgets");
    return parseStringify({
      success: false,
      message: "Failed to get budgets",
    });
  }
}

export async function createBudget({
  type,
  balanceId,
  categoryId,
  name,
  amount,
  startDate,
  endDate,
  month,
}: {
  type: "MONTHLY" | "CATEGORY" | "CUSTOM";
  balanceId: string;
  categoryId?: string;
  name?: string;
  amount: number;
  startDate: Date;
  endDate?: Date;
  month?: number;
}) {
  try {
    // Helper function to format a Date to "YYYY-MM-DD" string
    const formatDate = (date: Date): string => date.toISOString().split("T")[0];

    // Build the initial insert object using strings for dates.
    const budgetData: BudgetInsert = {
      type,
      name: name || null,
      category_id: categoryId || null,
      end_date: endDate ? formatDate(endDate) : null,
      month: month ?? null,
      balance_id: balanceId,
      amount: amount.toString(),
      start_date: formatDate(startDate),
      status: "ACTIVE",
    };

    // Adjust values based on the budget type.
    if (type === "CATEGORY" && categoryId) {
      budgetData.category_id = categoryId;
    }
    if (type === "CUSTOM" && name) {
      budgetData.name = name;
    }
    if (type === "MONTHLY") {
      if (month !== undefined) {
        budgetData.month = month;
        // Calculate a new end date based on the month value.
        const start = startDate; // already a Date
        const calculatedEndDate = new Date(
          start.getFullYear(),
          start.getMonth() + month,
          0
        );
        budgetData.start_date = formatDate(startDate);
        budgetData.end_date = formatDate(calculatedEndDate);
      }
    } else {
      // For non-MONTHLY types, just use the provided dates.
      budgetData.start_date = formatDate(startDate);
      if (endDate) {
        budgetData.end_date = formatDate(endDate);
      }
    }

    // Calculate the initial status.
    const today = new Date();
    const start = new Date(budgetData.start_date);
    const end = budgetData.end_date ? new Date(budgetData.end_date) : null;

    if (!end) {
      budgetData.status = "ACTIVE";
    } else if (today >= start && today <= end) {
      budgetData.status = "ACTIVE";
    } else if (today > end) {
      budgetData.status = "EXPIRED";
    } else {
      budgetData.status = "ACTIVE";
    }

    // Insert into the database.
    const createdBudget = await db
      .insert(budgets)
      .values(budgetData)
      .returning();

    // Create budget noti
    await updateBudgetNotification({
      budgetId: createdBudget[0].id,
      balanceId: balanceId,
      categoryId,
    });

    return parseStringify({
      success: true,
      message: "Successfully create budget",
      budget: createdBudget[0],
    });
  } catch (e) {
    handleError(e, "Failed to create Budget");
    return parseStringify({
      success: false,
      message: "Failed to create budget",
    });
  }
}

export async function updateBudget({
  budgetId,
  updates,
}: {
  budgetId: string;
  updates: Partial<{
    amount: number;
    startDate: string;
    endDate: string;
    name: string;
    categoryId: string;
    month: number;
  }>;
}) {
  try {
    // Convert camelCase update keys to snake_case expected by the database.
    const updateData: Partial<BudgetInsert> = {};
    if (updates.amount !== undefined) {
      updateData.amount = updates.amount.toString();
    }
    if (updates.startDate !== undefined) {
      updateData.start_date = updates.startDate;
    }
    if (updates.endDate !== undefined) {
      updateData.end_date = updates.endDate;
    }
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.categoryId !== undefined) {
      updateData.category_id = updates.categoryId;
    }
    if (updates.month !== undefined) {
      updateData.month = updates.month;
    }

    const updatedBudgetArray = await db
      .update(budgets)
      .set(updateData)
      .where(eq(budgets.id, budgetId))
      .returning();

    const budgetNoti = (
      await db
        .select()
        .from(budget_notifications)
        .where(eq(budget_notifications.budget_id, budgetId))
    )[0];

    await updateBudgetNotification({
      budgetId,
      balanceId: updatedBudgetArray[0].balance_id,
      budgetNotificationId: budgetNoti.id,
      categoryId: updates.categoryId,
    });

    revalidatePath("/budgets");

    return parseStringify({
      success: true,
      message: "Successfully update the budget",
      updatedBudget: updatedBudgetArray[0],
    });
  } catch (e) {
    handleError(e, "Failed to update budget");
    return parseStringify({
      success: false,
      message: "Failed to update budget",
    });
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const deletedBudget = await db
      .delete(budgets)
      .where(eq(budgets.id, budgetId))
      .returning();

    revalidatePath("/budgets");

    return parseStringify({
      success: true,
      message: "Successfully delete the budget",
      deletedBudget: deletedBudget[0],
    });
  } catch (e) {
    handleError(e, "Failed to delete budget");
    return parseStringify({
      success: false,
      message: "Failed to delete budget",
    });
  }
}

export async function getBudgetById(budgetId: string) {
  try {
    const budgetArray = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, budgetId));
    const budget = budgetArray[0];
    return parseStringify(budget);
  } catch (e) {
    handleError(e, `Failed to get budget with ID: ${budgetId}`);
  }
}

export async function setBudgetStatus(
  budgetId: string,
  newStatus: "ACTIVE" | "EXPIRED" | "CANCELED"
) {
  try {
    const updatedBudgetArray = await db
      .update(budgets)
      .set({ status: newStatus })
      .where(eq(budgets.id, budgetId))
      .returning();
    const updatedBudget = updatedBudgetArray[0];
    revalidatePath("/budgets");
    return parseStringify({
      success: true,
      message: `Successfully ${
        newStatus === "ACTIVE" ? "activate" : "cancel"
      } the budget`,
      updatedBudget,
    });
  } catch (e) {
    handleError(e, "Failed to toggle budget status");
    return parseStringify({
      success: false,
      message: "Failed to toggle budget status",
    });
  }
}
