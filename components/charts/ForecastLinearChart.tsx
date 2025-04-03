"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { format as formatDate } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Forecast } from "@/type";
import { getMonthName, getNumberOfDaysInCurrentMonth } from "@/lib/utils";
import {
  getExpensesByDate,
  getIncomeByDate,
} from "@/lib/actions/transaction.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Re-usable chart config

export function ForecastLinearChart({
  forecast,
  user,
}: {
  forecast: Forecast;
  user: any;
}) {
  const chartConfig: ChartConfig = {
    forecast: {
      label: "Forecast",
      color: "#dee2e6",
    },
    actual: {
      label: "Actual",
      color: `${user.color}`,
    },
  };

  // Toggle whether we show expense or income forecast
  const [type, setType] = useState<string>("expense");

  // We'll store chart data in state so it updates once we load transactions
  const [chartData, setChartData] = useState<
    Array<{ period: string; forecast: number; actual: number }>
  >([]);

  // Basic date calculations
  const today = new Date();
  const daysInMonth = getNumberOfDaysInCurrentMonth();
  const currentDay = today.getDate();

  // Forecast amounts (pick expense or income)
  const totalForecast =
    type === "expense"
      ? parseFloat(forecast.forecast_expense)
      : parseFloat(forecast.forecast_income);

  // Simple linear distribution: how much we *expect* by today
  const forecastUntilToday = (totalForecast / daysInMonth) * currentDay;

  // Format the title
  const forecastStartArr = forecast.forecast_start.toString().split("-");
  const month = getMonthName(forecastStartArr[1]);
  const year = forecastStartArr[0];
  // const formattedDate = `${monthName} - ${year}`;

  useEffect(() => {
    async function loadTransactions() {
      try {
        // 1) Fetch transactions from forecast_start to forecast_end
        const startDate = new Date(forecast.forecast_start);
        const endDate = new Date(forecast.forecast_end);

        let success = false;
        let transactions: Array<{
          amount: string;
          date: string;
          // ...other fields
        }> = [];

        if (type === "expense") {
          const result = await getExpensesByDate({
            balanceId: forecast.balance_id,
            startDate,
            endDate,
          });
          success = result.success;
          transactions = result.expenses || [];
        } else {
          const result = await getIncomeByDate({
            balanceId: forecast.balance_id,
            startDate,
            endDate,
          });
          success = result.success;
          transactions = result.incomes || [];
        }

        if (!success) return;

        // 2) Reduce to get actual sums:
        //    a) sum of all transactions up to today
        //    b) sum of all transactions in the entire month
        let actualUntilToday = 0;
        let actualUntilEndOfMonth = 0;

        for (const tx of transactions) {
          const txDate = new Date(tx.date);

          // Make sure transaction is within the forecast window
          if (txDate >= startDate && txDate <= endDate) {
            // If it's before or on "today", add to the "until today" sum
            if (txDate <= today) {
              actualUntilToday += parseFloat(tx.amount);
            }
            // It's within the entire forecast range, so also add to "end of month" sum
            actualUntilEndOfMonth += parseFloat(tx.amount);
          }
        }

        // 3) Build final chart data:
        //    - First point: Start of month (forecast = 0, actual = 0)
        //    - Second point: Today (forecast = forecastUntilToday, actual = actualUntilToday)
        //    - Third point: End of month (forecast = totalForecast, actual = actualUntilEndOfMonth)
        const newChartData = [
          {
            period: formatDate(startDate, "MMM d"), // e.g. "Mar 1"
            forecast: 0,
            actual: 0,
          },
          {
            period: formatDate(today, "MMM d"), // e.g. "Mar 12"
            forecast: forecastUntilToday,
            actual: actualUntilToday,
          },
          {
            period: formatDate(endDate, "MMM d"), // e.g. "Mar 31"
            forecast: totalForecast,
            actual: actualUntilEndOfMonth,
          },
        ];

        setChartData(newChartData);
      } catch (err) {
        console.error(err);
      }
    }

    loadTransactions();
  }, [forecast, type]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <p>
            Forecast for {month} - {year}
          </p>
          <Select
            defaultValue="expense"
            onValueChange={(value) => setType(value)}
          >
            <SelectTrigger className="w-[120px] text-gray-600">
              <SelectValue placeholder="Type: " />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          Showing the forecasted amount compared with the actual accumulated
          amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="forecast"
              type="linear"
              fill={chartConfig.forecast.color}
              fillOpacity={0.4}
              stroke={chartConfig.forecast.color}
            />
            <Area
              dataKey="actual"
              type="linear"
              fill={chartConfig.actual.color}
              fillOpacity={0.4}
              stroke={chartConfig.actual.color}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
