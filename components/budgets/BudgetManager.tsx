"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getBudgetsWithNotifications } from "@/lib/actions/budgetNotification.actions";
import { BudgetNotification, BudgetWithNotification, Category } from "@/type";

const chartConfig = {
  totalExpense: {
    label: "total expense",
    color: "hsl(var(--chart-1))",
  },
  amount: {
    label: "budget",
    color: "#adb5bd",
  },
} satisfies ChartConfig;

const CustomBar = ({ x, y, width, height, fill }: any) => {
  return (
    <rect x={x} y={y} width={width} height={height} fill={fill} rx={5} ry={5} />
  );
};

export default function BudgetManager({
  balanceId,
  refreshKey,
  categories,
}: {
  balanceId: string;
  refreshKey: number;
  categories: Category[];
}) {
  const [chartData, setChartData] = useState<BudgetWithNotification[]>([]);
  const [isLoading, setsIsLoading] = useState(false);

  useEffect(() => {
    async function fetchBudgetNotis() {
      try {
        setsIsLoading(true);
        const budgetNotifications = await getBudgetsWithNotifications(
          balanceId
        );
        setChartData(budgetNotifications);
      } catch (e) {
        console.log(e);
      } finally {
        setsIsLoading(false);
      }
    }

    fetchBudgetNotis();
  }, [balanceId, refreshKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Management</CardTitle>
        <CardDescription>Your budget visualization is here.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {!isLoading ? (
          <ChartContainer
            config={chartConfig}
            style={{
              maxHeight: `${chartData.length * 90}px`,
            }}
            className={`min-w-full ${chartData.length === 0 && "hidden"}`}
          >
            <BarChart data={chartData} layout="vertical" margin={{ left: -30 }}>
              <YAxis
                dataKey="$id"
                type="category"
                width={180}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value, index) => {
                  const budget = chartData[index];

                  let label = "";
                  if (budget.type === "CATEGORY") {
                    label = `Category: ${
                      categories.find((cate) => cate.id === budget.categoryId)
                        ?.name
                    }`;
                  }

                  if (budget.type === "MONTHLY") {
                    label = `Monthly: ${
                      budget.month ? budget.month : "Indefinite"
                    }`;
                  }

                  if (budget.type === "CUSTOM") {
                    label = `${budget.name}`;
                  }
                  return `${label}`;
                }}
              />

              <XAxis type="number" />

              {/* Tooltip */}
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideIndicator />}
              />
              <Bar
                dataKey="totalExpense"
                layout="vertical"
                radius={5} // Rounded corners
                name="Total Expense"
                shape={(props: any) => (
                  <CustomBar {...props} fill={props.payload.barColor} />
                )}
              />

              {/* Budget Bar */}
              <Bar
                dataKey="amount"
                fill="#B0BEC5"
                layout="vertical"
                radius={5}
                name="Budget"
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <Skeleton className="w-full h-[400px] rounded-xl" />
        )}
      </CardContent>
    </Card>
  );
}
