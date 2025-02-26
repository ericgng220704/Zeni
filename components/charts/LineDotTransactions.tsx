"use client";

import React, { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { format, parseISO, startOfMonth, subMonths, isAfter } from "date-fns";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getTransactionsForUser } from "@/lib/actions/transaction.actions";

const chartConfig = {
  total: {
    label: "Total",
  },
} satisfies ChartConfig;

function getLastSixMonths() {
  const months: string[] = [];
  let current = startOfMonth(new Date());

  for (let i = 0; i < 6; i++) {
    months.unshift(format(current, "LLL"));
    current = subMonths(current, 1);
  }
  return months;
}

export function LineDotTransaction({
  user,
  type,
}: {
  user: { id: string };
  type: "ALL" | "EXPENSE" | "INCOME";
}) {
  const [chartData, setChartData] = useState<
    Array<{ month: string; total: number }>
  >([]);

  useEffect(() => {
    async function loadTransactions() {
      // 1. Fetch transactions
      const response = await getTransactionsForUser({
        userId: user.id,
        type,
      });

      if (!response?.success) {
        return;
      }

      const transactions = response.transactions;

      // 2. Get an ordered list of the last 6 months
      const lastSixMonths = getLastSixMonths();

      // 3. Initialize each month with zero
      const grouped = lastSixMonths.reduce<Record<string, number>>(
        (acc, month) => {
          acc[month] = 0;
          return acc;
        },
        {}
      );

      // 4. For each transaction, if it falls within the last 6 months, add to the correct month
      const sixMonthsAgo = subMonths(new Date(), 6); // e.g. today minus 6 months

      transactions.forEach((tx: any) => {
        const dateObj = parseISO(tx.date);
        console.log(dateObj);
        console.log(sixMonthsAgo);
        if (isAfter(dateObj, sixMonthsAgo)) {
          const monthName = format(dateObj, "LLL");
          const amount = parseFloat(tx.amount) || 0;

          // Only accumulate if the month is in our 6-month map
          if (grouped[monthName] !== undefined) {
            grouped[monthName] += amount;
          }
        }
      });

      // 5. Convert our grouped data into an array in the same month order
      const dataForChart = lastSixMonths.map((month) => ({
        month,
        total: grouped[month],
      }));

      setChartData(dataForChart);
    }

    loadTransactions();
  }, [user, type]);

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Line
          dataKey="total"
          type="linear"
          stroke={type === "EXPENSE" ? "#fa5252" : "#40c057"}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
