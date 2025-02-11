"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getTransactions } from "@/lib/actions/transaction.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLast30Days, getLastSixMonths } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Balance, Transaction, User, UserMember } from "@/type";

type ChartData = {
  day?: string;
  month?: string;
  [payer: string]: number | string | undefined;
};

export default function UsersAreaStackChart({
  balanceId,
  uniquePayers,
}: {
  balanceId: string;
  uniquePayers: UserMember[];
}) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [type, setType] = useState<string>("expense");
  const [filter, setFilter] = useState<string>("monthly");

  useEffect(() => {
    async function loadTransactions() {
      const { transactions, success, message } = await getTransactions({
        balanceId: balanceId,
        type: type === "expense" ? "EXPENSE" : "INCOME",
        limit: 1000,
        offset: 0,
      });

      if (!success) return;

      // Determine the mode (days or months)
      const isDaily = filter === "daily";
      const timeLabels = isDaily ? getLast30Days() : getLastSixMonths();

      // Initialize chart data with 0 for all labels (days or months) and payers
      const initialChartData = timeLabels.map((label) => {
        const dataPoint: ChartData = isDaily
          ? { day: label }
          : { month: label };
        uniquePayers.forEach((payer: UserMember) => {
          dataPoint[payer.name] = 0;
        });
        return dataPoint;
      });

      // Aggregate transactions by day or month and payer
      const aggregatedData = transactions.reduce(
        (acc: ChartData[], transaction: Transaction) => {
          const date = new Date(transaction.date);
          const label = isDaily
            ? date.toISOString().split("T")[0] // Format as "YYYY-MM-DD"
            : date.toLocaleString("default", { month: "long" });
          const payer =
            uniquePayers.find((user) => user.id === transaction.user_id)
              ?.name || transaction.user_id;
          const amount = parseFloat(transaction.amount);

          // Find the corresponding data point in the chart data
          const dataPoint = acc.find((item) =>
            isDaily ? item.day === label : item.month === label
          );
          if (dataPoint) {
            dataPoint[payer] = (Number(dataPoint[payer]) || 0) + amount;
          }

          return acc;
        },
        initialChartData
      );
      setChartData(aggregatedData);
    }

    loadTransactions();
  }, [balanceId, filter, type]);

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <Select
            defaultValue="expense"
            onValueChange={(value) => setType(value)}
          >
            <SelectTrigger className="w-[120px] h3 text-gray-600">
              <SelectValue placeholder="Type: " />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
          <Select
            defaultValue="monthly"
            onValueChange={(value) => setFilter(value)}
          >
            <SelectTrigger className="w-[140px] text-xs border-none outline-none shadow-none">
              <SelectValue placeholder="View by" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem className="text-xs" value="daily">
                Last 30 Days
              </SelectItem>
              <SelectItem className="text-xs" value="monthly">
                Last 6 Months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          Showing total {type} by owners for the{" "}
          {filter === "daily" ? "last 30 Days" : "last 6 months"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 30, bottom: 40 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={filter === "daily" ? "day" : "month"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {Object.keys(chartData[0] || {})
              .filter((key) => key !== (filter === "daily" ? "day" : "month"))
              .map((payer) => {
                const color = uniquePayers.filter(
                  (uiquePayer) => uiquePayer.name === payer
                )[0]?.color;
                return (
                  <Area
                    key={payer}
                    dataKey={payer}
                    stackId="a"
                    type="natural"
                    fill={color || "#ccc"}
                    fillOpacity={0.4}
                    stroke={color || "#ccc"}
                  />
                );
              })}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
