"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Category } from "@/type";

const chartConfig = {
  total: {
    label: "Total: ",
  },
} satisfies ChartConfig;

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryType: "EXPENSE" | "INCOME";
  total: string;
}

interface VerticalBarChartCategoryTotalProps {
  data: CategoryTotal[];
}

export function VerticalBarChartCategoryTotal({
  data,
}: VerticalBarChartCategoryTotalProps) {
  const chartData = data.map((item) => ({
    categoryName: item.categoryName,
    categoryColor: item.categoryColor,
    total: Number(item.total),
  }));

  const height = chartData.length * 50 + 50;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="h2 text-gray-800">Category Totals</CardTitle>
        <CardDescription>Aggregated totals across all balances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 h-full">
        <ChartContainer config={chartConfig} style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
              <YAxis
                dataKey="categoryName"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />

              <XAxis dataKey="total" type="number" hide />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="total" layout="vertical" radius={5}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.categoryColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total spending across all categories
          </div>
        </CardFooter> */}
    </Card>
  );
}
