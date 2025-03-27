import { db } from "@/database/drizzle";
import { balances } from "@/database/schema";
import { calculateForecast } from "@/lib/actions/forecast.actions";
import { generateTips } from "@/lib/actions/personalTip.actions";
import { getCurrentMonthDates } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("Unauthorized request received");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("Fetching balances with forecasting enabled...");

    const balanceList = await db
      .select({
        id: balances.id,
        name: balances.name,
        current_balance: balances.current_balance,
        total_income: balances.total_income,
        total_expense: balances.total_expense,
        created_at: balances.created_at,
      })
      .from(balances)
      .where(eq(balances.is_forecasting_enabled, true));

    console.log(
      `Found ${balanceList.length} balance(s) with forecasting enabled. Starting forecast and tip generation...`
    );

    const forecastGenerationResults = await Promise.all(
      balanceList.map(async (balance) => {
        try {
          console.log(`Generating forecast for balance: ${balance.id}`);
          const { first, last } = getCurrentMonthDates();
          const { success, forecast } = await calculateForecast({
            balanceId: balance.id,
            startDate: first,
            endDate: last,
            periodType: "MONTH",
          });
          if (!success) {
            console.error(
              `Forecast generation failed for balance: ${balance.id}`
            );
            return { balanceId: balance.id, status: "failed" };
          }
          console.log(
            `Successfully generated forecast for balance: ${balance.id}`
          );
          return { balanceId: balance.id, status: "success", forecast };
        } catch (error) {
          console.error(
            `Error generating forecast for balance: ${balance.id}`,
            error
          );
          return { balanceId: balance.id, status: "failed", error };
        }
      })
    );

    const tipGenerationResults = await Promise.all(
      balanceList.map(async (balance) => {
        try {
          console.log(`Generating tips for balance: ${balance.id}`);
          const { result } = await generateTips(balance.id);
          console.log(`Successfully generated tips for balance: ${balance.id}`);
          return { balanceId: balance.id, status: "success", result };
        } catch (error) {
          console.error(
            `Error generating tips for balance: ${balance.id}`,
            error
          );
          return { balanceId: balance.id, status: "failed", error };
        }
      })
    );

    console.log("Forecast and tip generation processes completed.");

    return NextResponse.json({
      message: "Global personal tip generation completed.",
      processedCount: balanceList.length,
      tipResults: tipGenerationResults,
      forecastResults: forecastGenerationResults,
    });
  } catch (error) {
    console.error("Error globally generating personal tips:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
