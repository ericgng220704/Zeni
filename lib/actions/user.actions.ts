"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return parseStringify({
        success: false,
        message: "No user found!",
      });
    } else {
      return parseStringify({
        success: true,
        user: user[0],
      });
    }
  } catch (e) {
    handleError(e, "Failed to get user!");
    return parseStringify({
      success: false,
      message: "Failed to get user!",
    });
  }
}
