"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActivityLog = {
  id: string;
  user_id: string;
  balance_id: string | null;
  action: string;
  description: string | null;
  created_at: Date;
};

interface Props {
  logs: ActivityLog[];
  user: any;
}

export function AreaActivity({ logs, user }: Props) {
  // Add a state for the time range filter
  const [timeRange, setTimeRange] = React.useState("7d");

  // Filter logs based on the selected time range
  const filteredLogs = React.useMemo(() => {
    let days = 7;
    if (timeRange === "1m") {
      days = 30;
    } else if (timeRange === "6m") {
      days = 180;
    }
    const referenceDate = new Date();
    const startDate = new Date(referenceDate);
    startDate.setDate(referenceDate.getDate() - days);
    return logs.filter((log) => new Date(log.created_at) >= startDate);
  }, [logs, timeRange]);

  // Transform raw (filtered) logs into daily grouped data
  const dailyData = React.useMemo(() => {
    return transformActivityLogs(filteredLogs);
  }, [filteredLogs]);

  const chartConfig = {
    activity: {
      label: "Daily Activity",
      color: user.color || "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="flex items-center justify-between gap-2 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="h2 text-gray-800">Activity Chart</CardTitle>
          <CardDescription>Showing daily activity counts</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px] rounded-lg">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="1m">1 month</SelectItem>
            <SelectItem value="6m">6 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="fillActivity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-activity)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-activity)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            {/* X-axis with date labels */}
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                // Example: "Jan 1"
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            {/* Tooltip showing the full date + count */}
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />

            {/* Single area for the daily "count" */}
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillActivity)"
              stroke="var(--color-activity)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Utility function to group logs by day
function transformActivityLogs(logs: ActivityLog[]) {
  const grouped = logs.reduce((acc, log) => {
    const date = new Date(log.created_at);
    const dateKey = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[dateKey]) {
      acc[dateKey] = 0;
    }
    acc[dateKey]++;
    return acc;
  }, {} as Record<string, number>);

  const result = Object.entries(grouped).map(([date, count]) => ({
    date,
    count,
  }));

  result.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return result;
}
