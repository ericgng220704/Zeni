"use client";

import React, { useEffect, useState } from "react";
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
import { initiate } from "@/lib/actions/dashboard.actions";
import { useToast } from "@/hooks/use-toast";
import {
  CategoryTotal,
  VerticalBarChartCategoryTotal,
} from "../charts/VerticalBarChartCategoryTotal";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn, getIconByName } from "@/lib/utils";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { LineDotTransaction } from "../charts/LineDotTransactions";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage({ user }: { user: any }) {
  const [balances, setBalances] = useState<Balance[]>();
  const [categories, setCategories] = useState<Category[]>();
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>();
  const [activities, setActivities] = useState<ActivityLog[]>();
  const { toast } = useToast();

  const mostActiveBalanceData = React.useMemo(() => {
    if (!activities || activities.length === 0) return null;
    // Group the logs by balance_id and count them
    const counts = activities.reduce((acc, log) => {
      if (log.balance_id) {
        acc[log.balance_id] = (acc[log.balance_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Find the balance_id with the highest count
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

  useEffect(() => {
    async function init() {
      const {
        success,
        balanceList,
        categoryList,
        categoryTotalList,
        recentTransactionList,
        activityList,
      } = await initiate(user.id);

      if (!success) {
        toast({
          description: "Oops something went wrong",
        });
        return;
      }

      setBalances(balanceList);
      setCategories(categoryList);
      setCategoryTotals(categoryTotalList);
      setRecentTransactions(recentTransactionList);
      setActivities(activityList);
    }

    init();
  }, [user]);

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
    <div>
      <div className="first grid grid-cols-5 gap-3 grid-rows-5 w-full">
        <div className="col-span-3 row-span-2">
          {balances && (
            <Card>
              <CardHeader>
                <CardTitle className="h2 text-gray-800">All balances</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[170px] w-full pr-3">
                  {balances &&
                    [...balances]
                      .sort((a, b) => {
                        // Place the most active balance at the top
                        if (a.id === mostActiveBalanceData?.balanceId)
                          return -1;
                        if (b.id === mostActiveBalanceData?.balanceId) return 1;
                        // Sort remaining balances by current_balance in descending order
                        return (
                          parseFloat(b.current_balance) -
                          parseFloat(a.current_balance)
                        );
                      })
                      .map((balance) => {
                        const isMostActive =
                          balance.id === mostActiveBalanceData?.balanceId;
                        return (
                          <div key={balance.id} className="py-1">
                            <div className="flex items-center justify-between">
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
                                {balance.current_balance}
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
        <div className="col-span-2 row-span-5 flex flex-col justify-between">
          {recentTransactions && categories && balances && (
            <Card className="">
              <CardHeader>
                <CardTitle className="h2 text-gray-800">
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Most recent transactions across all balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.map((transaction: Transaction) => {
                  const category = categories.filter(
                    (category) => category.id === transaction.category_id
                  )[0];
                  const balance = balances.find(
                    (balance) => balance.id === transaction.balance_id
                  );
                  const Icon = getIconByName(category.icon);
                  return (
                    <div key={transaction.id} className="mb-2">
                      <div className="w-full hover:bg-gray-50 rounded-lg flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Avatar className="size-8 text-sm">
                            <AvatarFallback
                              style={{
                                backgroundColor: category.color,
                              }}
                            >
                              <Icon size={14} className="text-gray-500" />
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex gap-3 items-center">
                            <span className="text-gray-700">
                              {category.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {balance?.name}
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
                            {transaction.amount}
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
                  <div className="flex items-center justify-center bg-green-200 p-3 rounded-lg text-gray-700">
                    <FaArrowUp size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">${totalIncome}</span>
                    <span className=" text-gray-600">Incoming</span>
                  </div>
                  <LineDotTransaction user={user} type="INCOME" />
                </div>

                <Separator className="my-4" />

                <div className="flex items-center gap-4 h-16">
                  <div className="flex items-center justify-center bg-red-200 p-3 rounded-lg text-gray-700">
                    <FaArrowDown size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">${totalExpense}</span>
                    <span className=" text-gray-600">Outgoing</span>
                  </div>
                  <LineDotTransaction user={user} type="EXPENSE" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="col-span-3 row-span-3">
          {activities && <AreaActivity logs={activities} user={user} />}
        </div>
      </div>
      {categoryTotals && categories && (
        <div className="my-4">
          <VerticalBarChartCategoryTotal data={categoryTotals} />
        </div>
      )}
    </div>
  );
}
