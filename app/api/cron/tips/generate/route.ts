import { db } from "@/database/drizzle";
import { balances, user_balances } from "@/database/schema";
import { generateTips } from "@/lib/actions/personalTip.actions";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
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
        user_id: user_balances.user_id,
      })
      .from(balances)
      .innerJoin(user_balances, eq(balances.id, user_balances.balance_id))
      .where(eq(balances.is_forecasting_enabled, true));

    console.log(
      `Found ${balanceList.length} balance(s) with forecasting enabled. Starting tip generation...`
    );

    // Use Promise.all to run generateTips concurrently.
    const tipGenerationResults = await Promise.all(
      balanceList.map(async (balance) => {
        try {
          console.log(
            `Generating tips for balance: ${balance.id} (User: ${balance.user_id})`
          );
          const { result } = await generateTips(balance.user_id, balance.id);
          console.log(`Successfully generated tips for balance: ${balance.id}`);
          return { balanceId: balance.id, status: "success", result };
        } catch (e) {
          console.error(
            `Failed to generate tips for balance: ${balance.id} (User: ${balance.user_id})`,
            e
          );
          return { balanceId: balance.id, status: "failed", error: e };
        }
      })
    );

    console.log("Tip generation process completed.", tipGenerationResults);

    return NextResponse.json({
      message: "Global personal tip generation completed.",
      processedCount: balanceList.length,
      results: tipGenerationResults,
    });
  } catch (error) {
    console.error("Error globally generating personal tips:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
