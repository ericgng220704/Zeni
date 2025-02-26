"use server";

import { db } from "@/database/drizzle";
import { handleError, parseStringify } from "../utils";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { logActivity } from "./activityLog.actions";

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
  userId,
}: {
  name: string;
  color: string;
  defaultBalanceId?: string;
  userId: string;
}) {
  try {
    await db
      .update(users)
      .set({
        name,
        color,
        defaultBalance: defaultBalanceId,
      })
      .where(eq(users.id, userId));

    after(async () => {
      await logActivity("USER_UPDATE");
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

export async function updateUserProfileChatbot({
  name,
  color,
  defaultBalanceId,
}: {
  name?: string;
  color?: string;
  defaultBalanceId?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user) return;

    // Build the update data object conditionally.
    const updateData: {
      name?: string;
      color?: string;
      defaultBalance?: string;
    } = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (color !== undefined) {
      updateData.color = color;
    }

    if (defaultBalanceId !== undefined) {
      updateData.defaultBalance = defaultBalanceId;
    }

    // Only update if there's something to update.
    if (Object.keys(updateData).length === 0) {
      return parseStringify({
        success: false,
        message: "No fields provided for update.",
      });
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id || ""));

    after(async () => {
      await logActivity("USER_UPDATE");
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

      after(async () => {
        await logActivity(
          "CHATBOT_USAGE",
          undefined,
          `Current limit: ${chatbotLimit - 1}`
        );
      });

      return parseStringify({
        success: true,
        decreasable: true,
        currentLimit: chatbotLimit - 1,
      });
    } else {
      after(async () => {
        await logActivity(
          "CHATBOT_USAGE",
          undefined,
          `Current limit: ${chatbotLimit - 1}`
        );
      });
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
