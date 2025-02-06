"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { categories } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getCategories(type?: string) {
  try {
    const categoriesList = await db
      .select()
      .from(categories)
      .where(
        type
          ? eq(categories.type, type === "expense" ? "EXPENSE" : "INCOME")
          : undefined
      );

    return parseStringify(categoriesList);
  } catch (e) {
    handleError(e, "Failed to fetch categories");
    return parseStringify({
      success: false,
      message: "Failed to fetch categories",
    });
  }
}
