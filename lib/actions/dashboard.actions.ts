"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { getBalances } from "./balance.actions";
import {
  activity_logs,
  categories,
  category_totals,
  transactions,
  user_balances,
} from "@/database/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCategories } from "./category.actions";

export async function initiate(userId: string) {
  try {
    const balanceList = await getBalances();
    const categoryList = await getCategories();

    const categoryTotalList = await db
      .select({
        categoryId: category_totals.category_id,
        categoryName: categories.name,
        categoryColor: categories.color,
        categoryType: categories.type,
        total: sql`SUM(${category_totals.total})`,
      })
      .from(category_totals)
      .innerJoin(
        user_balances,
        eq(category_totals.balance_id, user_balances.balance_id)
      )
      .innerJoin(categories, eq(category_totals.category_id, categories.id))
      .where(eq(user_balances.user_id, userId))
      .groupBy(
        category_totals.category_id,
        categories.name,
        categories.color,
        categories.type
      );

    const recentTransactionList = await db
      .select()
      .from(transactions)
      .where(eq(transactions.user_id, userId))
      .orderBy(desc(transactions.date))
      .limit(8);

    const activityList = await db
      .select()
      .from(activity_logs)
      .where(eq(activity_logs.user_id, userId))
      .orderBy(desc(activity_logs.created_at));

    return parseStringify({
      success: true,
      balanceList,
      categoryList,
      categoryTotalList,
      recentTransactionList,
      activityList,
    });
  } catch (e) {
    handleError(e, "Oops Something went wrong");
    return parseStringify({
      success: false,
      message: "Oops something went wrong!",
    });
  }
}
