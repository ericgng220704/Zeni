"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { categories, category_totals } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getCategoryTotalsByBalance(balanceId: string) {
  try {
    const categoryTotals = await db
      .select()
      .from(category_totals)
      .where(eq(category_totals.balance_id, balanceId));

    return parseStringify(categoryTotals);
  } catch (e) {
    handleError(e, "Failed to get category total");
    return parseStringify({
      success: false,
      message: "Failed to get category total",
    });
  }
}

export async function getCategoryTotalsByBalanceChatbot(balanceId: string) {
  try {
    const categoryTotals = await db
      .select({
        id: categories.id,
        type: categories.type,
        name: categories.name,
        total: category_totals.total,
        fill: categories.color,
      })
      .from(category_totals)
      .innerJoin(categories, eq(categories.id, category_totals.category_id))
      .where(eq(category_totals.balance_id, balanceId));

    const categoriesList = await db.select().from(categories);

    return parseStringify({ categoryTotals, categoriesList });
  } catch (e) {
    handleError(e, "Failed to get category total");
    return parseStringify({
      success: false,
      message: "Failed to get category total",
    });
  }
}
