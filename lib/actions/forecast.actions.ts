"use server";

import { db } from "@/database/drizzle";
import {
  recurring_transactions,
  transactions,
  forecasts,
  balances,
} from "@/database/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import {
  getNumberOfDaysInCurrentMonth,
  handleError,
  parseStringify,
} from "../utils";

/**
 * calculateForecast:
 * 1. Summation of all recurring transactions that fall within [startDate, endDate].
 * 2. Summation based on historical average daily income/expense, extrapolated for the forecast period.
 *
 * @param userId       The ID of the user
 * @param startDate    The start date of the forecast window
 * @param endDate      The end date of the forecast window
 * @param historicalLookbackDays  How many days of past data to consider for the historical trend (e.g. 90 for ~3 months)
 * @returns An object containing forecastIncome, forecastExpense, and forecastNet
 */
export async function calculateForecast({
  userId,
  balanceId,
  startDate,
  endDate,
  periodType,
}: {
  userId: string;
  balanceId: string;
  startDate: Date;
  endDate: Date;
  periodType: "WEEK" | "MONTH";
}) {
  try {
    const historicalLookbackDays = 30;

    // Sanity check
    if (endDate <= startDate) {
      throw new Error("End date must be after start date.");
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 1) Recurring Transactions in the Forecast Window
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Fetch all active recurring transactions for the user
    const activeRecurring = await db
      .select()
      .from(recurring_transactions)
      .where(
        and(
          eq(recurring_transactions.user_id, userId),
          eq(recurring_transactions.balance_id, balanceId),
          eq(recurring_transactions.status, "ACTIVE")
        )
      );

    let recurringIncomeTotal = 0;
    let recurringExpenseTotal = 0;

    for (const rt of activeRecurring) {
      const rtDate = new Date(rt.date);
      const intervalMs = parseInt(rt.interval.toString(), 10);

      // If interval or date is invalid, skip
      if (isNaN(rtDate.getTime()) || isNaN(intervalMs)) {
        continue;
      }

      // Find the earliest occurrence within the forecast window.
      // The next execution might be in the past or the future.
      // If rtDate < startDate, we need to move it forward until it's >= startDate.
      while (rtDate < startDate) {
        rtDate.setTime(rtDate.getTime() + intervalMs);
      }

      // Now, accumulate occurrences within [startDate, endDate].
      while (rtDate <= endDate) {
        const amount = parseFloat(rt.amount.toString());
        if (rt.type === "INCOME") {
          recurringIncomeTotal += amount;
        } else {
          recurringExpenseTotal += amount;
        }

        // Move to next occurrence
        rtDate.setTime(rtDate.getTime() + intervalMs);
      }
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 2) Historical Trend (Average Daily Approach)
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // look back N days from startDate to gather historical data.
    const historicalStart = new Date(startDate);
    historicalStart.setDate(historicalStart.getDate() - historicalLookbackDays);

    // Query the user's transactions in that lookback window
    const historicalTxs = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.user_id, userId),
          eq(transactions.balance_id, balanceId),
          gte(transactions.date, historicalStart),
          lte(transactions.date, startDate), // up to but not including the forecast start,
          eq(transactions.is_recurring, false)
        )
      );

    // Sum income/expense over that period
    let historicalIncome = 0;
    let historicalExpense = 0;

    for (const tx of historicalTxs) {
      const amount = parseFloat(tx.amount.toString());
      if (tx.type === "INCOME") {
        historicalIncome += amount;
      } else {
        historicalExpense += amount;
      }
    }

    // Calculate daily averages
    const daysInHistoricalWindow = Math.max(
      1,
      Math.floor(
        (startDate.getTime() - historicalStart.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const avgDailyIncome = historicalIncome / daysInHistoricalWindow;
    const avgDailyExpense = historicalExpense / daysInHistoricalWindow;

    // Forecast period length in days
    const forecastDays =
      periodType === "WEEK" ? 7 : getNumberOfDaysInCurrentMonth();

    // The "historical" portion of the forecast
    const historicalIncomeForecast = avgDailyIncome * forecastDays;
    const historicalExpenseForecast = avgDailyExpense * forecastDays;

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // 3) Combine Recurring + Historical
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    const totalIncome = recurringIncomeTotal + historicalIncomeForecast;
    const totalExpense = recurringExpenseTotal + historicalExpenseForecast;
    const net = totalIncome - totalExpense;

    const forecast = await db.insert(forecasts).values({
      user_id: userId,
      balance_id: balanceId,
      period_type: periodType,
      forecast_start: startDate,
      forecast_end: endDate,
      forecast_income: totalIncome.toString(),
      forecast_expense: totalExpense.toString(),
      forecast_net: net.toString(),
    });

    if (forecast) {
      return parseStringify({
        success: true,
        message: "Forecast successfully!",
        forecast,
      });
    }
  } catch (e) {
    handleError(e, `Failed to forecast for user ${userId}`);
    return parseStringify({
      success: false,
      message: `Failed to forecast for user ${userId}`,
    });
  }
}

export async function enableForecast(balanceId: string) {
  try {
    const result = await db
      .update(balances)
      .set({
        is_forecasting_enabled: true,
      })
      .where(eq(balances.id, balanceId))
      .returning();

    return parseStringify({
      success: true,
      message: "Successfully enable Forecasting",
      balance: result[0],
    });
  } catch (e) {
    handleError(e, "Failed to enable Forecasting");
    return parseStringify({
      success: false,
      message: "Failed to enable Forecasting",
    });
  }
}
