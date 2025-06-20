"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
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
import { formatNumber } from "@/lib/utils";
import { Category, CategoryTotal } from "@/type";

import * as React from "react";
import { Pie, PieChart, Label, ResponsiveContainer } from "recharts";

export default function CategoryTotalsCard({
  data,
  subtype,
}: {
  data: {
    dataType: "categoryTotals";
    action: "get_category_totals_by_balance";
    categoryTotals: any;
    categories: Category[];
  };
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}) {
  if (
    data.dataType !== "categoryTotals" ||
    !data.categoryTotals ||
    !data.categories
  )
    return null;

  const [type, setType] = React.useState("EXPENSE");

  const { categoryTotals } = data;

  const chartConfig = {
    visitors: {
      label: "Visitors",
    },
    chrome: {
      label: "Chrome",
      color: "hsl(var(--chart-1))",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
    firefox: {
      label: "Firefox",
      color: "hsl(var(--chart-3))",
    },
    edge: {
      label: "Edge",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig;

  const transformedData = categoryTotals
    .filter((item: any) => item.type === type)
    .map((item: any) => {
      return {
        name: item.name,
        value: parseFloat(item.total),
        fill: item.fill,
      };
    });

  const totalAmount = transformedData.reduce(
    (acc: number, curr: any) => acc + curr.value,
    0
  );

  const formattedTotal = formatNumber(totalAmount.toString());
  const dynamicInnerRadius = 50 + (formattedTotal.length - 2) * 4;
  return (
    <Card className="min-w-[380px]">
      <CardHeader className=" flex flex-col justify-center items-center">
        <div className="flex items-center gap-8 ">
          <div>
            <CardTitle>Category Totals</CardTitle>
            <CardDescription>
              Your category totals visualization
            </CardDescription>
          </div>
          <Select
            defaultValue="EXPENSE"
            onValueChange={(value) => setType(value)}
          >
            <SelectTrigger className="w-[120px] !h-7">
              <SelectValue placeholder="Type: " />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {categoryTotals.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={transformedData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={dynamicInnerRadius}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {formattedTotal}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center text-center h-full">
            <p>Oops! There is now transactions yet!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
