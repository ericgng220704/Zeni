"use server";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { activity_logs } from "@/database/schema";
import { ActivityLogActions } from "@/type";
import { handleError } from "../utils";

export async function logActivity(
  action: ActivityLogActions,
  balanceId?: string,
  description?: string
) {
  try {
    const session = await auth();

    if (!session || !session.user) return;

    if (session.user?.id) {
      await db.insert(activity_logs).values({
        user_id: session.user.id,
        balance_id: balanceId,
        action,
        description,
      });
    }
  } catch (e) {
    handleError(e, "Failed to record activity");
  }
}
