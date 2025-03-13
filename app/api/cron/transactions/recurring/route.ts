import { db } from "@/database/drizzle";
import { recurring_transactions } from "@/database/schema";
import { updateRecurringTransactionDate } from "@/lib/actions/recurringTransaction.actions";
import { createTransaction } from "@/lib/actions/transaction.actions";
import { lt } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Fetch all recurring transactions that are due (next_execution_date < now)
    const dueRecurringTransactions = await db
      .select()
      .from(recurring_transactions)
      .where(lt(recurring_transactions.date, now));

    console.log(
      `Found ${
        dueRecurringTransactions.length
      } recurring transactions due at ${now.toISOString()}`
    );

    // Process each due recurring transaction
    for (const recurring of dueRecurringTransactions) {
      try {
        // Create the actual transaction record
        const { success, transaction } = await createTransaction({
          amount: parseFloat(recurring.amount),
          description: recurring.note || "",
          date: now,
          balanceId: recurring.balance_id,
          categoryId: recurring.category_id || "",
          type: recurring.type,
          is_recurring: true,
        });

        if (success) {
          console.log(`Created new transaction ${transaction.id}`);
        } else {
          throw new Error(
            `Failed to create new transaction from recurring transaction`
          );
        }

        // Convert stored date into a Date object
        const originalDate = new Date(recurring.date);
        if (isNaN(originalDate.getTime())) {
          throw new Error(
            `Invalid recurring.date for transaction ${recurring.id}`
          );
        }

        // Parse and validate the interval (stored as string or number)
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

    // Respond with a summary
    return NextResponse.json({
      message: `Processed ${dueRecurringTransactions.length} transactions`,
    });
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
