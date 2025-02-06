"use server";

import { auth } from "@/auth";
import { db } from "@/database/drizzle";
import { balances, user_balances, users } from "@/database/schema";
import { and, eq } from "drizzle-orm";
import { handleError, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { Balance } from "@/type";

export async function getBalances() {
  try {
    const session = await auth();

    if (!session?.user) return;

    const balancesList = await db
      .select({
        id: balances.id,
        name: balances.name,
        current_balance: balances.current_balance,
        total_income: balances.total_income,
        total_expense: balances.total_expense,
        created_at: balances.created_at,
      })
      .from(user_balances)
      .innerJoin(balances, eq(user_balances.balance_id, balances.id))
      .where(eq(user_balances.user_id, `${session.user.id}`));

    if (balancesList.length === 0) {
      return parseStringify([]);
    }
    return parseStringify(balancesList);
  } catch (error) {
    handleError(error, "Failed to get balances");
  }
}

export async function getUserBalances(balanceId: string) {
  try {
    const userMembers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        color: users.color,
        role: user_balances.role,
        joinedAt: user_balances.created_at,
      })
      .from(user_balances)
      .innerJoin(users, eq(user_balances.user_id, users.id))
      .where(eq(user_balances.balance_id, balanceId));

    if (userMembers.length === 0) {
      return parseStringify([]);
    }

    return parseStringify(userMembers);
  } catch (e) {
    handleError(e, `Failed to get user members for balance ${balanceId}`);
    return parseStringify([]);
  }
}

export async function getBalanceById(balanceId: string) {
  try {
    const balance = await db
      .select()
      .from(balances)
      .where(eq(balances.id, balanceId));

    return parseStringify(balance[0]);
  } catch (e) {
    handleError(e, "failed to get Balance");
  }
}

export async function createBalance({
  name,
  currentBalance,
}: {
  name: string;
  currentBalance: number;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) return;

    const balance = await db
      .insert(balances)
      .values({
        name,
        current_balance: currentBalance.toString(),
        total_income: "0",
        total_expense: "0",
      })
      .returning();

    if (!balance[0].id) return;

    await db.insert(user_balances).values({
      user_id: session.user.id,
      balance_id: balance[0].id,
      role: "OWNER",
    });

    revalidatePath("/balances");

    return parseStringify({
      success: true,
      message: `Balance ${balance[0].name} was successfully created!`,
      balance: balance[0],
    });
  } catch (e) {
    handleError(e, "Failed to create balance");
    return parseStringify({
      success: false,
      message: "Failed to create balance",
    });
  }
}

export async function updateBalance({
  balanceId,
  name,
  currentBalance,
}: {
  balanceId: string;
  name?: string;
  currentBalance?: string;
}) {
  try {
    const updates: Record<string, any> = {};

    if (name) updates.name = name;
    if (currentBalance) updates.currentBalance = currentBalance;

    const updatedBalance = await db
      .update(balances)
      .set(updates)
      .where(eq(balances.id, balanceId))
      .returning();

    return parseStringify({
      success: true,
      message: `${updatedBalance[0].name} was updated successfully!`,
      updatedBalance: updatedBalance[0],
    });
  } catch (e) {
    handleError(e, `Failed to update balance ${balanceId}`);
    return parseStringify({
      success: false,
      message: `Failed to update balance ${balanceId}`,
    });
  }
}

export async function deleteBalance(balanceId: string) {
  try {
    const deletedBalance = await db
      .delete(balances)
      .where(eq(balances.id, balanceId))
      .returning();

    return parseStringify({
      success: true,
      message: `${deletedBalance[0].name} was successfully deleted!`,
      deletedBalance: deletedBalance[0],
    });
  } catch (e) {
    handleError(e, `Failed to delete Balance ${balanceId}`);
    return parseStringify({
      success: false,
      message: `Failed to delete Balance ${balanceId}`,
    });
  }
}

export async function addNewUserToBalance({
  balanceId,
  email,
}: {
  balanceId: string;
  email: string;
}) {
  try {
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user[0]) {
      return parseStringify({
        success: false,
        message: `${email} does not exist in the system!`,
      });
    }

    // Check if the user is already linked to the balance
    const existingUserBalance = await db
      .select()
      .from(user_balances)
      .where(
        and(
          eq(user_balances.user_id, user[0].id),
          eq(user_balances.balance_id, balanceId)
        )
      );

    if (existingUserBalance.length > 0) {
      return parseStringify({
        success: false,
        message: `${email} is already a member of the balance!`,
      });
    }

    await db.insert(user_balances).values({
      user_id: user[0].id,
      balance_id: balanceId,
      role: "MEMBER",
    });

    revalidatePath(`/balances/${balanceId}`);

    return parseStringify({
      success: true,
      message: `${email} has been successfully added to the balance as a MEMBER!`,
    });
  } catch (e) {
    handleError(e, `Failed to add user ${email} to balance ${balanceId}`);
    return parseStringify({
      success: false,
      message: `Failed to add user ${email} to balance ${balanceId}`,
    });
  }
}

export async function updateUserBalanceRole({
  userId,
  balanceId,
  role,
}: {
  userId: string;
  balanceId: string;
  role: "OWNER" | "MEMBER";
}) {
  try {
    const updatedUserBalances = await db
      .update(user_balances)
      .set({
        role,
      })
      .where(
        and(
          eq(user_balances.balance_id, balanceId),
          eq(user_balances.user_id, userId)
        )
      )
      .returning();

    revalidatePath(`/balances/${balanceId}`);

    return parseStringify({
      success: true,
      message: ``,
      updatedUserBalances: updatedUserBalances[0],
    });
  } catch (e) {
    handleError(e, ``);
  }
}

// CHAT BOT FUNCTIONS
export async function getUserBalanceByName(name: string) {
  try {
    const userBalanceList = await getBalances();

    const balance = userBalanceList.find(
      (userBalance: Balance) => userBalance.name === name
    );

    if (balance) {
      return parseStringify({
        success: true,
        balance: balance,
      });
    } else {
      return parseStringify({
        success: false,
        message: `No balance named ${name} was found in your account.`,
      });
    }
  } catch (e) {
    handleError(e, "Failed to get Balance");
    return parseStringify({
      success: false,
      message: "Failed to get Balance",
    });
  }
}
