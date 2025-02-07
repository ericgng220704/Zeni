"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { signOut } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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

export async function SignOut() {
  try {
    await signOut();
    redirect("/sign-in");
  } catch (e) {
    handleError(e, "Failed to sign out!");
  }
}

export async function updateUserProfile({
  name,
  color,
  defaultBalanceId,
}: {
  name: string;
  color: string;
  defaultBalanceId?: string;
}) {
  try {
    await db.update(users).set({
      name,
      color,
      defaultBalance: defaultBalanceId,
    });
    revalidatePath("/");

    return parseStringify({
      success: true,
    });
  } catch (e) {
    handleError(e, "Failed to update user profile");
    return parseStringify({
      success: false,
      message: "Failed to update user profile",
    });
  }
}

export async function decreaseChatbotLimit(userId: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const chatbotLimit = parseFloat(user[0].chatbotLimit || "0");
    if (chatbotLimit > 0) {
      await db
        .update(users)
        .set({
          chatbotLimit: (chatbotLimit - 1).toString(),
        })
        .where(eq(users.id, userId));

      return parseStringify({
        success: true,
        decreasable: true,
        currentLimit: chatbotLimit - 1,
      });
    } else {
      return parseStringify({
        success: true,
        decreasable: false,
        currentLimit: chatbotLimit - 1,
      });
    }
  } catch (e) {
    handleError(e, "Failed");
    return parseStringify({
      success: false,
      message: "Failed",
    });
  }
}

export async function setNotNewUser(userId: string) {
  try {
    await db
      .update(users)
      .set({
        isNewUser: false,
      })
      .where(eq(users.id, userId));

    return parseStringify({
      success: true,
    });
  } catch (e) {
    handleError(e, "failed");
    return parseStringify({
      success: false,
      message: "Failed",
    });
  }
}
