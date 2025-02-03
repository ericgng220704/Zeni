"use client";

import { useState, useEffect, useCallback } from "react";
import TransactionList from "./TransactionList";
import { getTransactions } from "@/lib/actions/transaction.actions";
import TransactionForm from "./TransactionForm";
import { capitalizeFirstLetter } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Balance, BudgetWithNotification, Category, Transaction } from "@/type";
import { loadTransactionPage } from "@/lib/actions/initalLoad.actions";
import { getBudgetsWithNotifications } from "@/lib/actions/budgetNotification.actions";
import { AiFillSafetyCertificate } from "react-icons/ai";
import { AiFillWarning } from "react-icons/ai";
import { IoIosAlert } from "react-icons/io";

export default function TransactionPage({ type }: { type: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetNotis, setBudgetNotis] = useState<BudgetWithNotification[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<string>();

  const limit = 10;

  // Initial Load
  useEffect(() => {
    async function InitialLoad() {
      const { success, balances, categories } = await loadTransactionPage({
        categoryType: type,
      });

      if (success) {
        setBalances(balances);
        setCategories(categories);
        setSelectedBalance(balances[0].id);
      }
    }

    InitialLoad();
  }, []);

  useEffect(() => {
    async function fetchBudgetNotis() {
      if (!selectedBalance) return;
      const budgetNotis = await getBudgetsWithNotifications(selectedBalance);

      setBudgetNotis(budgetNotis);
    }

    fetchBudgetNotis();
  }, [selectedBalance]);

  // Fetch Transactions
  const fetchTransactions = useCallback(async () => {
    if (!hasMore || loading || !selectedBalance) return;

    setLoading(true);

    try {
      const { transactions, success, message } = await getTransactions({
        balanceId: selectedBalance,
        type: type === "expense" ? "EXPENSE" : "INCOME",
        limit,
        offset,
      });

      if (!success) return;

      setTransactions((prev) => {
        const existingIds = new Set(prev.map((transaction) => transaction.id));
        const uniqueTransactions = transactions.filter(
          (transaction: Transaction) => !existingIds.has(transaction.id)
        );
        return [...prev, ...uniqueTransactions];
      });

      setHasMore(transactions.length === limit);
      setOffset((prev) => prev + limit);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, offset, selectedBalance, type]);

  // Reset state and re-fetch when selectedBalance changes
  useEffect(() => {
    setTransactions([]);
    setOffset(0);
    setHasMore(true);
    setLoading(false); // Reset loading state
  }, [selectedBalance]);

  // Use IntersectionObserver to trigger fetching more transactions
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchTransactions();
        }
      },
      { threshold: 1.0 }
    );

    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [fetchTransactions, hasMore, loading]);

  const handleTransactionCreated = (newTransaction: any) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const handleTransactionUpdated = (updatedTransaction: Transaction) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transaction.id === updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== transactionId)
    );
  };

  return (
    <div className="px-2 md:px-5 lg:px-10 mb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="h1">{capitalizeFirstLetter(type)}</h1>
          <Select
            onValueChange={(value) => setSelectedBalance(value)}
            value={selectedBalance || balances[0]?.id || ""}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Balance" />
            </SelectTrigger>
            <SelectContent>
              {balances.map((balance: Balance, index: number) => (
                <SelectItem key={balance.id + index} value={balance.id}>
                  {balance.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {balances && (
          <TransactionForm
            type={type}
            balances={balances}
            categories={categories}
            onTransactionCreated={handleTransactionCreated}
          />
        )}
      </div>

      {type === "expense" && (
        <div className="mt-2 mb-6">
          <Accordion type="single" collapsible className="">
            <AccordionItem value="item-1" className="">
              <AccordionTrigger>Budgets Notifications</AccordionTrigger>
              {budgetNotis
                .sort(
                  (a: BudgetWithNotification, b: BudgetWithNotification) => {
                    const order = { ALERT: 1, WARNING: 2, SAFE: 3 };
                    return (
                      order[a.notificationStatus] - order[b.notificationStatus]
                    );
                  }
                )
                .map((noti: BudgetWithNotification) => {
                  let label = "";
                  let description = "";
                  let progressValue = 0;
                  let progressColor = "";

                  if (noti.type === "CATEGORY") {
                    label = `Category: ${
                      categories.find((cate) => cate.id === noti.categoryId)
                        ?.name
                    }`;
                  }

                  if (noti.type === "MONTHLY") {
                    label = `Monthly: ${
                      noti.month ? noti.month : "Indefinite"
                    }`;
                  }

                  if (noti.type === "CUSTOM") {
                    label = `${noti.name}`;
                  }

                  // Add descriptive message
                  if (noti.notificationStatus === "ALERT") {
                    description =
                      "You have spent over the budget amount. Please adjust the budget amount or stay alert with your spending.";
                    progressValue = 100; // Full progress for ALERT
                    progressColor = "red";
                  } else if (noti.notificationStatus === "WARNING") {
                    description =
                      "You are nearing the budget limit. Consider revising your spending habits to stay within the budget.";
                    progressValue =
                      noti.amount > 0
                        ? (noti.totalExpense / noti.amount) * 100
                        : 0;
                    progressColor = "yellow";
                  } else if (noti.notificationStatus === "SAFE") {
                    description =
                      "Your spending is within the budget. Keep up the great work!";
                    progressValue =
                      noti.amount > 0
                        ? (noti.totalExpense / noti.amount) * 100
                        : 0;
                    progressColor = "green";
                  }

                  return (
                    <AccordionContent key={noti.budgetId} className="w-full">
                      <div
                        className={`p-4 rounded-xl  ${
                          noti.notificationStatus === "WARNING" &&
                          "bg-gradient-to-b from-yellow-100 to-yellow-50 order-2"
                        } ${
                          noti.notificationStatus === "ALERT" &&
                          "bg-gradient-to-b from-red-100 to-red-50 order-1"
                        } ${
                          noti.notificationStatus === "SAFE" &&
                          "bg-gradient-to-b from-green-100 to-green-50 order-5"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            {noti.notificationStatus === "ALERT" && (
                              <div className="bg-white rounded-full p-3">
                                <IoIosAlert
                                  size={25}
                                  className="text-red-500"
                                />
                              </div>
                            )}
                            {noti.notificationStatus === "WARNING" && (
                              <div className="bg-white rounded-full p-3">
                                <AiFillWarning
                                  size={25}
                                  className="text-yellow-400"
                                />
                              </div>
                            )}
                            {noti.notificationStatus === "SAFE" && (
                              <div className="bg-white rounded-full p-3">
                                <AiFillSafetyCertificate
                                  size={25}
                                  className="text-green-500"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div>
                              <p className="text-base font-semibold">{label}</p>
                              <span className="text-xs text-gray-600">
                                Budget id: {noti.budgetId}
                              </span>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600">
                                {description}
                              </p>
                            </div>
                            <div className="w-full">
                              <Progress
                                value={progressValue}
                                color={noti.barColor || undefined}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  );
                })}
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* Transaction List */}
      {transactions.length > 0 ? (
        <TransactionList
          transactions={transactions}
          categories={categories}
          balances={balances}
          onTransactionUpdated={handleTransactionUpdated}
          onTransactionDeleted={handleDeleteTransaction}
        />
      ) : !loading ? (
        <div className="text-center text-gray-500 mt-6">
          <p>No transactions found for the selected balance.</p>
          <p>Start by adding a new transaction.</p>
        </div>
      ) : null}

      {/* Infinite Scroll Sentinel */}
      {loading && <p className="text-center text-gray-500 mt-2">Loading...</p>}
      <div id="scroll-sentinel" className="h-1"></div>
    </div>
  );
}
