"use client";

import * as React from "react";
import { Pie, PieChart, Label } from "recharts";
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
import { useEffect, useState } from "react";
import { getCategoryTotalsByBalance } from "@/lib/actions/categoryTotal.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Category, CategoryTotal } from "@/type";
import { formatNumber } from "@/lib/utils";

export default function CategoryPieChart({
  balanceId,
  categories,
}: {
  balanceId: string;
  categories: Category[];
}) {
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const [type, setType] = useState("EXPENSE");

  useEffect(() => {
    async function loadCategoryTotal() {
      const response = await getCategoryTotalsByBalance(balanceId);

      if (response.length === 0) {
        return;
      }

      setCategoryTotals(response);
    }

    loadCategoryTotal();
  }, [balanceId]);

  // Calculate total

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

  // Filter and transform data to match the chart format
  const transformedData = categoryTotals
    .filter((item: CategoryTotal) => item.type === type)
    .map((item: CategoryTotal) => {
      const category = categories.find(
        (category) => category.id === item.category_id
      );
      return {
        name: category?.name,
        value: parseFloat(item.total),
        fill: category?.color,
      };
    });

  // Calculate the total amount for the filtered data
  const totalAmount = transformedData.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  const formattedTotal = formatNumber(totalAmount.toString());
  const dynamicInnerRadius = 50 + (formattedTotal.length - 2) * 4;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex items-center gap-8 ">
          <CardTitle className="h5 md:h4">
            Categories{" "}
            <span className="hidden xs:inline-block">distribution</span>
          </CardTitle>
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
        <CardDescription>Showing total {type}s by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {categoryTotals.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
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
