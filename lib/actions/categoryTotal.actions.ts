"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { category_totals } from "@/database/schema";
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
