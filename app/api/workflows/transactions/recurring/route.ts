"use server";
import { serve } from "@upstash/workflow/nextjs";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { db } from "@/database/drizzle";
import { recurring_transactions } from "@/database/schema";
import { eq } from "drizzle-orm";
import { deleteRecurringTransaction } from "@/lib/actions/recurringTransaction.actions";

// This workflow processes a recurring transaction at a fixed interval.
// It runs indefinitely until an external condition terminates it.

type RecurringTransactionData = {
  amount: number;
  description: string;
  date: string;
  balanceId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  // recurrenceInterval is expected to be in milliseconds.
  recurrenceInterval: number;
  recurringTransactionId: string;
};

export const { POST } = serve<RecurringTransactionData>(async (context) => {
  const {
    amount,
    description,
    date: dateInput,
    balanceId,
    categoryId,
    type,
    recurrenceInterval,
    recurringTransactionId,
  } = context.requestPayload;

  // Parse the incoming date (which might be a string) into a Date object.
  const scheduledDate = new Date(dateInput);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Invalid date provided in request payload.");
  }

  const now = new Date();

  // --- Step 1: Check if the scheduled date is now (or in the past) ---
  if (now.getTime() >= scheduledDate.getTime()) {
    console.log(
      `Scheduled date (${scheduledDate.toISOString()}) is in the past or now. Processing immediately.`
    );
    try {
      await createTransaction({
        amount,
        description,
        // Use current time for the transaction if the scheduled date has passed.
        date: now,
        balanceId,
        categoryId,
        type,
      });
    } catch (error) {
      console.error("Error processing immediate transaction:", error);
      throw error;
    }
  } else {
    // --- Step 2: Wait until the scheduled date ---
    const delay = scheduledDate.getTime() - now.getTime();
    console.log(
      `Waiting ${delay} ms until first execution at ${scheduledDate.toISOString()}`
    );
    await context.sleep("wait-for-first-execution", delay);
    try {
      await createTransaction({
        amount,
        description,
        date: scheduledDate,
        balanceId,
        categoryId,
        type,
      });
    } catch (error) {
      console.error("Error processing first scheduled transaction:", error);
      throw error;
    }
  }

  // --- Step 3: Start the recurring transaction loop ---
  while (true) {
    // Calculate the next execution time from the current moment.
    const nextExecutionTime = new Date(Date.now() + recurrenceInterval);
    console.log(
      `Next execution scheduled at ${nextExecutionTime.toISOString()}`
    );

    // Sleep until the next execution time.
    await context.sleepUntil("wait-for-scheduled-execution", nextExecutionTime);

    const currentRecurringTransaction = await context.run(
      "check-for-status",
      async () => {
        return await db
          .select()
          .from(recurring_transactions)
          .where(eq(recurring_transactions.id, recurringTransactionId));
      }
    );

    if (currentRecurringTransaction[0].status === "CANCELED") {
      console.log(
        "Cancellation. Terminating recurring workflow. Deleting Recurring Transaction"
      );
      await deleteRecurringTransaction(currentRecurringTransaction[0].id);
      break;
    }

    try {
      await createTransaction({
        amount,
        description,
        // Use the scheduled next execution time as the transaction date.
        date: nextExecutionTime,
        balanceId,
        categoryId,
        type,
      });
    } catch (error) {
      console.error("Error processing recurring transaction:", error);
      // if a transaction fails, wait a short period before retrying.
      await context.sleep("retry-after-error", 5 * 60 * 1000);
    }
  }
});
