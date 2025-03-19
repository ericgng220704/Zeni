"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { messages } from "@/database/schema";
import { asc, desc, eq } from "drizzle-orm";
import { after } from "next/server";
import { logActivity } from "./activityLog.actions";

export async function saveMessage({
  userId,
  sender,
  message,
}: {
  userId: string;
  sender: string;
  message: string;
}) {
  try {
    const savedMessage = await db.insert(messages).values({
      user_id: userId,
      sender,
      message,
    });

    after(async () => {
      await logActivity("MESSAGES_CREATE", undefined, message);
    });

    return parseStringify({
      success: true,
      message: "",
      savedMessage,
    });
  } catch (e) {
    handleError(e, "Failed to save message!");
    return parseStringify({
      success: false,
      message: "Failed to save message!",
    });
  }
}

export async function getMessages({
  userId,
  page,
  limit,
}: {
  userId: string;
  page: number;
  limit: number;
}) {
  try {
    const offset = (page - 1) * limit;

    const messageList = await db
      .select()
      .from(messages)
      .where(eq(messages.user_id, userId))
      .orderBy(desc(messages.created_at))
      .limit(limit)
      .offset(offset);

    const hasMore = messageList.length === limit;

    return parseStringify({
      success: true,
      messages: messageList,
      hasMore,
    });
  } catch (e) {
    handleError(e, "Failed to retrieve messages");
    return parseStringify({
      success: true,
      message: "Failed to retrieve messages",
    });
  }
}

export async function clearMessageByUserId(userId: string) {
  try {
    await db.delete(messages).where(eq(messages.user_id, userId));

    after(async () => {
      await logActivity("MESSAGES_DELETE");
    });

    return parseStringify({
      success: true,
      message: "Successfully clear Chat history!",
    });
  } catch (e) {
    handleError(e, "Failed to clear message!");
    return parseStringify({
      success: false,
      message: "Failed to clear message!",
    });
  }
}
