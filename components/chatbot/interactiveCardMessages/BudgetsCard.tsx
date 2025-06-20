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
import { Category, BudgetWithNotification } from "@/type";

const chartConfig = {
  totalExpense: {
    label: "Total Spent",
    color: "hsl(var(--chart-1))",
  },
  amount: {
    label: "Budget",
    color: "#adb5bd",
  },
} satisfies ChartConfig;

const CustomBar = ({ x, y, width, height, fill }: any) => (
  <rect x={x} y={y} width={width} height={height} fill={fill} rx={5} ry={5} />
);

export default function BudgetCardMessage({
  data,
  subtype,
}: {
  data: {
    dataType: "budgets";
    action: "get_budgets";
    budgets: BudgetWithNotification[];
    categories: Category[];
  };
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}) {
  if (data.dataType !== "budgets" || !data.budgets) return null;

  const { budgets } = data;
  const categories: Category[] = data.categories;

  return (
    <Card className="min-w-[380px]">
      <CardHeader className=" flex flex-col justify-center items-center">
        <CardTitle>Budget Management</CardTitle>
        <CardDescription>Your budget visualization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {budgets.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            style={{ maxHeight: `${budgets.length * 90}px` }}
            className="min-w-full"
          >
            <BarChart data={budgets} layout="vertical" margin={{ left: -30 }}>
              <YAxis
                dataKey="$id"
                type="category"
                width={180}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(_, idx) => {
                  const b = budgets[idx];
                  if (b.type === "CATEGORY") {
                    const cat = categories.find((c) => c.id === b.categoryId);
                    return `Category: ${cat?.name ?? "Unknown"}`;
                  }
                  if (b.type === "MONTHLY") {
                    return `Monthly: ${b.month ?? "Indefinite"}`;
                  }
                  return b.name ?? "Custom Budget";
                }}
              />
              <XAxis type="number" />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideIndicator />}
              />

              <Bar
                dataKey="totalExpense"
                layout="vertical"
                name="Spent"
                shape={(props: any) => (
                  <CustomBar {...props} fill={props.payload.barColor} />
                )}
              />
              <Bar
                dataKey="amount"
                fill="#B0BEC5"
                layout="vertical"
                name="Budget"
                shape={(props: any) => <CustomBar {...props} />}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No budgets to display.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
