"use server";

import { serve } from "@upstash/workflow/nextjs";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { db } from "@/database/drizzle";
import { recurring_transactions } from "@/database/schema";
import { lt } from "drizzle-orm";
import { updateRecurringTransactionDate } from "@/lib/actions/recurringTransaction.actions";

export const { POST } = serve(async (context) => {
  // This loop will run indefinitely until canceled or an error occurs.
  while (true) {
    const now = new Date();

    // 1. Fetch all recurring transactions that are due (i.e. next_execution_date < now)
    const dueRecurringTransactions = await db
      .select()
      .from(recurring_transactions)
      .where(lt(recurring_transactions.date, now));

    console.log(
      `Found ${
        dueRecurringTransactions.length
      } recurring transactions due at ${now.toISOString()}`
    );

    // 2. Process each due recurring transaction
    for (const recurring of dueRecurringTransactions) {
      try {
        // Create the actual transaction record
        await createTransaction({
          amount: parseFloat(recurring.amount),
          description: recurring.note || "",
          date: now,
          balanceId: recurring.balance_id,
          categoryId: recurring.category_id || "",
          type: recurring.type,
        });

        // Parse the stored date into a Date object
        const originalDate = new Date(recurring.date);
        if (isNaN(originalDate.getTime())) {
          throw new Error(
            `Invalid recurring.date for transaction ${recurring.id}`
          );
        }

        // Ensure the interval is a valid number (assuming it's stored as a string or number)
        const intervalMs = parseInt(recurring.interval);
        if (isNaN(intervalMs)) {
          throw new Error(
            `Invalid recurring.interval for transaction ${recurring.id}`
          );
        }

        // Calculate the next execution date
        const newNextExecutionDate = new Date(
          originalDate.getTime() + intervalMs
        );
        if (isNaN(newNextExecutionDate.getTime())) {
          throw new Error(
            `Calculated invalid newNextExecutionDate for transaction ${recurring.id}`
          );
        }

        // Update the recurring transaction record
        await updateRecurringTransactionDate({
          recurringTransactionId: recurring.id,
          nextExecuteDate: newNextExecutionDate,
        });

        console.log(
          `Processed recurring transaction ${
            recurring.id
          }. Next execution at ${newNextExecutionDate.toISOString()}`
        );
      } catch (error) {
        console.error(
          `Error processing recurring transaction ${recurring.id}:`,
          error
        );
      }
    }

    // 3. Sleep until the next poll.
    // Adjust the polling frequency (here, 24 hours) as necessary.
    const pollIntervalMs = 24 * 60 * 60; // 24 hours
    console.log(
      `Sleeping for ${
        pollIntervalMs / (1000 * 60 * 60)
      } hours before the next poll...`
    );
    await context.sleep("wait-for-next-poll", pollIntervalMs);
  }
});
