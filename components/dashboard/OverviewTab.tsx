"use client";

import React from "react";
import { AreaActivity } from "../charts/AreaActivities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityLog, Balance, Category, Transaction } from "@/type";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GoArrowUpRight } from "react-icons/go";
import {
  CategoryTotal,
  VerticalBarChartCategoryTotal,
} from "../charts/VerticalBarChartCategoryTotal";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn, formatNumber, getIconByName } from "@/lib/utils";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { LineDotTransaction } from "../charts/LineDotTransactions";
import { Badge } from "@/components/ui/badge";

interface OverviewTabProps {
  user: any;
  balances: Balance[];
  categories: Category[];
  categoryTotals: CategoryTotal[];
  recentTransactions: Transaction[];
  activities: ActivityLog[];
}

export default function OverviewTab({
  user,
  balances,
  categories,
  categoryTotals,
  recentTransactions,
  activities,
}: OverviewTabProps) {
  // Compute the most active balance from the activities data.
  const mostActiveBalanceData = React.useMemo(() => {
    if (!activities || activities.length === 0) return null;
    const counts = activities.reduce((acc, log) => {
      if (log.balance_id) {
        acc[log.balance_id] = (acc[log.balance_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    let mostActiveBalanceId = "";
    let maxCount = 0;
    for (const [balanceId, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveBalanceId = balanceId;
      }
    }
    return { balanceId: mostActiveBalanceId, count: maxCount };
  }, [activities]);

  // Calculate total income and expense from categoryTotals.
  let totalIncome = 0;
  let totalExpense = 0;
  if (categoryTotals) {
    ({ totalIncome, totalExpense } = categoryTotals.reduce(
      (acc, item) => {
        const amount = Number(item.total);
        if (item.categoryType === "INCOME") {
          acc.totalIncome += amount;
        } else if (item.categoryType === "EXPENSE") {
          acc.totalExpense += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    ));
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md-800:grid md-800:grid-cols-5 gap-3 md-800:grid-rows-5 w-full ">
        <div className="col-span-3 row-span-2">
          {balances && (
            <Card className="">
              <CardHeader>
                <CardTitle className="h2 text-gray-800">All balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-1 w-full -mt-3">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm text-gray-600">name</p>
                    <p className="text-sm text-gray-600">current balance</p>
                  </div>
                  <Separator />
                </div>
                <ScrollArea className="h-[155px] w-full pr-3">
                  {[...balances]
                    .sort((a, b) => {
                      // Place the most active balance at the top.
                      if (a.id === mostActiveBalanceData?.balanceId) return -1;
                      if (b.id === mostActiveBalanceData?.balanceId) return 1;
                      return (
                        parseFloat(b.current_balance) -
                        parseFloat(a.current_balance)
                      );
                    })
                    .map((balance) => {
                      const isMostActive =
                        balance.id === mostActiveBalanceData?.balanceId;
                      return (
                        <div key={balance.id} className="py-1 w-full">
                          <div className="flex items-center justify-between w-full">
                            <Link
                              href={`/balances/${balance.id}`}
                              className="flex items-center gap-1 hover:gap-2 transition-all duration-200"
                            >
                              <span className="hover:text-gray-500">
                                {balance.name}
                              </span>
                              <span className="text-gray-700">
                                <GoArrowUpRight />
                              </span>
                              {isMostActive && (
                                <Badge className="bg-black/90">
                                  Most Active 🔥
                                </Badge>
                              )}
                            </Link>
                            <p className="font-medium">
                              {formatNumber(balance.current_balance)}
                            </p>
                          </div>
                          <Separator />
                        </div>
                      );
                    })}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="md-800:col-span-2 md-800:row-span-5 flex flex-col md-800:gap-0 gap-3 justify-between">
          {recentTransactions && categories && balances && (
            <Card className="">
              <CardHeader>
                <CardTitle className="h2 text-gray-800">
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Most recent transactions across all balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.map((transaction: Transaction) => {
                  const category = categories.find(
                    (cat) => cat.id === transaction.category_id
                  );
                  const balanceItem = balances.find(
                    (bal) => bal.id === transaction.balance_id
                  );
                  const Icon = category ? getIconByName(category.icon) : null;
                  return (
                    <div key={transaction.id} className="mb-2">
                      <div className="w-full hover:bg-gray-50 rounded-lg flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Avatar className="size-8 text-sm">
                            <AvatarFallback
                              style={{
                                backgroundColor: category?.color,
                              }}
                            >
                              {Icon && (
                                <Icon size={14} className="text-gray-500" />
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex gap-3 items-center">
                            <span className="text-gray-700">
                              {category?.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {balanceItem?.name}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span
                            className={
                              transaction.type === "EXPENSE"
                                ? "text-red-400"
                                : "text-green-500"
                            }
                          >
                            {formatNumber(transaction.amount)}
                          </span>
                        </div>
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {categoryTotals && (
            <Card className="">
              <CardContent className="py-6">
                <div className="flex items-center gap-4 h-16">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center bg-green-200 p-3 rounded-lg text-gray-700">
                      <FaArrowUp size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">
                        ${totalIncome.toFixed(2)}
                      </span>
                      <span className="text-gray-600">Incoming</span>
                    </div>
                  </div>
                  <LineDotTransaction user={user} type="INCOME" />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-4 h-16">
                  <div className="flex items-center justify-center bg-red-200 p-3 rounded-lg text-gray-700">
                    <FaArrowDown size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">
                      ${totalExpense.toFixed(2)}
                    </span>
                    <span className="text-gray-600">Outgoing</span>
                  </div>
                  <LineDotTransaction user={user} type="EXPENSE" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="col-span-3 row-span-3 max-w-[325px] xs:max-w-none">
          {activities && <AreaActivity logs={activities} user={user} />}
        </div>
      </div>
      <div className="w-full hidden md-800:block">
        {categoryTotals && categories && (
          <div className="my-4">
            <VerticalBarChartCategoryTotal data={categoryTotals} />
          </div>
        )}
      </div>
    </div>
  );
}
