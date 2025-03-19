"use server";

import { db } from "@/database/drizzle";
import { openai } from "../openAi";
import { handleError, parseStringify } from "../utils";
import {
  budgets,
  forecasts,
  personal_tips,
  transactions,
} from "@/database/schema";
import { and, desc, eq, gte } from "drizzle-orm";
import { after } from "next/server";
import { logActivity } from "./activityLog.actions";

export async function generateTips(balanceId: string) {
  try {
    // Fetch the latest forecast for the user.
    const latestForecast = (
      await db
        .select()
        .from(forecasts)
        .where(eq(forecasts.balance_id, balanceId))
        .orderBy(desc(forecasts.computed_at))
        .limit(1)
    )[0];

    // Define historical window as the last 30 days.
    const historicalStart = new Date();
    historicalStart.setDate(historicalStart.getDate() - 30);

    // Fetch transactions from the last 3 months (excluding recurring ones).
    const last3monthTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.balance_id, balanceId),
          gte(transactions.date, historicalStart),
          eq(transactions.is_recurring, false)
        )
      );

    // Fetch active budgets for the balance.
    const budgetList = await db
      .select()
      .from(budgets)
      .where(
        and(eq(budgets.balance_id, balanceId), eq(budgets.status, "ACTIVE"))
      );

    // Format transactions as a JSON array (each object on its own line)
    const formattedTransactions = last3monthTransactions
      .map((tx) => {
        return `{
                "id": "${tx.id}",
                "categoryId": "${tx.category_id}",
                "amount": "${tx.amount}",
                "type": "${tx.type}",
                "isRecurring": ${tx.is_recurring},
                "note": "${tx.note}",
                "date": "${tx.date}"
              }`;
      })
      .join(",\n");

    // Format budgets as a JSON array.
    const formattedBudgets = budgetList
      .map((budget) => {
        return `{
                  "id": "${budget.id}",
                  "name": "${budget.name}",
                  "amount": "${budget.amount}",
                  "status": "${budget.status}"
                }`;
      })
      .join(",\n");

    // Refined prompt instructing the AI.
    const prompt = `
You are a professional financial data analyst working for Zeni, an expense management app.
Analyze the following data and provide:
1. A detailed analysis of the user's financial situation.
2. A summarized analysis (maximum 150 words).
3. 2 to 4 actionable tips for improving or maintaining financial health.

Provided Data:

Latest Forecast:
- Forecasted Income: ${latestForecast.forecast_income}
- Forecasted Expense: ${latestForecast.forecast_expense}
- Forecasted Net: ${latestForecast.forecast_net}
- Forecast Period: ${latestForecast.forecast_start} to ${latestForecast.forecast_end}

Historical Transactions (last 3 months):
[
${formattedTransactions}
]

Active Budgets:
[
${formattedBudgets}
]

Return your answer in the following JSON format:
{
  "tips": [ "Tip1", "Tip2", ... ],
  "summarized_analysis": "Your summarized analysis here...",
  "detailed_analysis": "Your detailed analysis here..."
}

Note: Please replace the user with you or your.
    `;

    // Call OpenAI API with a system message and the refined prompt.
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional financial data analyst working for Zeni. Analyze user forecast data, historical transactions, and budgets to provide a detailed analysis, a summarized analysis (max 150 words), and 2 to 4 actionable tips.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const data = response.choices[0].message.content || "";

    const { tips, summarized_analysis, detailed_analysis } = JSON.parse(data);
    if (!tips || !summarized_analysis || !detailed_analysis) {
      throw new Error("GPT response is missing required fields.");
    }

    let existingTip = (
      await db
        .select()
        .from(personal_tips)
        .where(and(eq(personal_tips.balance_id, balanceId)))
    )[0];

    let result;

    if (existingTip) {
      // Update the existing record.
      result = await db
        .update(personal_tips)
        .set({
          forecast_id: latestForecast.id,
          tips_json: JSON.stringify(tips),
          summarized_analysis,
          detailed_analysis,
        })
        .where(eq(personal_tips.id, existingTip.id))
        .returning();
    } else {
      // Insert a new record.
      result = await db
        .insert(personal_tips)
        .values({
          balance_id: balanceId,
          forecast_id: latestForecast.id,
          tips_json: JSON.stringify(tips),
          summarized_analysis,
          detailed_analysis,
        })
        .returning();
    }

    after(async () => {
      await logActivity("PERSONAL_TIPS_CREATE", balanceId, result.toString());
    });

    return parseStringify({
      success: true,
      message: "Tips generated successfully",
      result,
    });
  } catch (e) {
    handleError(e, "Failed to generate tips");
    return parseStringify({
      success: false,
      message: "Failed to generate tips",
    });
  }
}
