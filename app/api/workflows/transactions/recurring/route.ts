"use server";
import { serve } from "@upstash/workflow/nextjs";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { db } from "@/database/drizzle";
import { recurring_transactions } from "@/database/schema";
import { eq } from "drizzle-orm";
import { deleteRecurringTransaction } from "@/lib/actions/recurringTransaction.actions";

const MAX_SLEEP_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

type RecurringTransactionData = {
  amount: number;
  description: string;
  date: string;
  balanceId: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  recurrenceInterval: number;
  recurringTransactionId: string;
};

async function chunkedSleep(
  context: any,
  label: string,
  totalMs: number,
  recurringTransactionId: string
) {
  let remaining = totalMs;

  while (remaining > 0) {
    // Check if canceled before each chunk
    const currentRecurringTransaction = await context.run(
      "check-for-status",
      async () => {
        return await db
          .select()
          .from(recurring_transactions)
          .where(eq(recurring_transactions.id, recurringTransactionId));
      }
    );

    if (currentRecurringTransaction[0]?.status === "CANCELED") {
      console.log(
        "Cancellation detected during sleep. Terminating recurring workflow and deleting record."
      );
      await deleteRecurringTransaction(currentRecurringTransaction[0].id);
      // Throwing an error here just to exit the workflow gracefully.
      throw new Error("Recurring transaction canceled");
    }

    // Sleep for either the remainder or 7 days, whichever is smaller.
    const chunk = Math.min(remaining, MAX_SLEEP_MS);
    await context.sleep(label, chunk);
    remaining -= chunk;
  }
}

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

  const scheduledDate = new Date(dateInput);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error("Invalid date provided in request payload.");
  }

  const now = new Date();

  // --- Step 1: If the scheduled date is in the past or now, process immediately. ---
  if (now.getTime() >= scheduledDate.getTime()) {
    console.log(
      `Scheduled date (${scheduledDate.toISOString()}) is in the past or now. Processing immediately.`
    );
    try {
      await createTransaction({
        amount,
        description,
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
    // --- Otherwise, wait (in chunks) until the scheduled date, then process. ---
    const delay = scheduledDate.getTime() - now.getTime();
    console.log(
      `Waiting ${delay} ms until first execution at ${scheduledDate.toISOString()}`
    );
    try {
      await chunkedSleep(
        context,
        "wait-for-first-execution",
        delay,
        recurringTransactionId
      );
      await createTransaction({
        amount,
        description,
        date: scheduledDate,
        balanceId,
        categoryId,
        type,
      });
    } catch (error: any) {
      if (error.message === "Recurring transaction canceled") {
        return;
      }
      console.error("Error processing first scheduled transaction:", error);
      throw error;
    }
  }

  // --- Step 2: Start the recurring transaction loop ---
  while (true) {
    // We'll calculate the next interval in MS, then chunk-sleep.
    const nextExecutionTime = new Date(Date.now() + recurrenceInterval);
    console.log(
      `Next execution scheduled at ${nextExecutionTime.toISOString()}`
    );

    try {
      // Sleep for the recurrence interval in chunks (if > 7 days).
      await chunkedSleep(
        context,
        "wait-for-scheduled-execution",
        recurrenceInterval,
        recurringTransactionId
      );
    } catch (error: any) {
      // If canceled during chunked sleep, exit the workflow.
      if (error.message === "Recurring transaction canceled") {
        return;
      }
      console.error("Error during chunked sleep:", error);
      throw error;
    }

    // Check if the recurring transaction was canceled before creating the new transaction
    const currentRecurringTransaction = await context.run(
      "check-for-status",
      async () => {
        return await db
          .select()
          .from(recurring_transactions)
          .where(eq(recurring_transactions.id, recurringTransactionId));
      }
    );

    if (currentRecurringTransaction[0]?.status === "CANCELED") {
      console.log(
        "Cancellation. Terminating recurring workflow. Deleting Recurring Transaction."
      );
      await deleteRecurringTransaction(currentRecurringTransaction[0].id);
      break;
    }

    try {
      await createTransaction({
        amount,
        description,
        date: nextExecutionTime,
        balanceId,
        categoryId,
        type,
      });
    } catch (error) {
      console.error("Error processing recurring transaction:", error);
      // If a transaction fails, wait 5 minutes (in chunks if needed), then retry.
      const retryDelay = 5 * 60 * 1000; // 5 minutes
      try {
        console.log(`Waiting ${retryDelay} ms before retrying...`);
        await chunkedSleep(
          context,
          "retry-after-error",
          retryDelay,
          recurringTransactionId
        );
      } catch (chunkError: any) {
        if (chunkError.message === "Recurring transaction canceled") {
          return;
        }
        throw chunkError;
      }
    }
  }
});
