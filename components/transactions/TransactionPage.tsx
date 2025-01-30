"use client";

import { useState, useEffect, useCallback } from "react";
import TransactionList from "./TransactionList";
import { getTransactions } from "@/lib/actions/transaction.actions";
import TransactionForm from "./TransactionForm";
import { capitalizeFirstLetter } from "@/lib/utils";
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
import { Balance, Category, Transaction } from "@/type";
import { loadTransactionPage } from "@/lib/actions/initalLoad.actions";
// import { AiFillSafetyCertificate } from 'react-icons/ai';
// import { AiFillWarning } from 'react-icons/ai';
// import { IoIosAlert } from 'react-icons/io';

// import { getBudgetNotifications } from "@/lib/actions/budgetNotification.actions";

export default function TransactionPage({ type }: { type: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgetNotis, setBudgetNotis] = useState<any>([]);
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

  // Fetch budget notifications
  // useEffect(() => {
  //   async function fetchBudgetNotis() {
  //     try {
  //       const budgetNotifications = await getBudgetNotifications({
  //         balanceId: selectedBalance,
  //       });

  //       console.log(budgetNotifications);
  //       setBudgetNotis(budgetNotifications.documents);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }

  //   fetchBudgetNotis();
  // }, [selectedBalance, transactions]);

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
          <Accordion type="single" collapsible className="max-w-[800px]">
            <AccordionItem value="item-1">
              <AccordionTrigger>Budgets Notifications</AccordionTrigger>
              {budgetNotis.map((noti: any) => (
                <AccordionContent key={noti.$id}>
                  <div
                    className={`p-4 rounded-md  ${
                      noti.status === "warning" &&
                      "bg-gradient-to-b from-yellow-200 to-yellow-50"
                    } ${
                      noti.status === "alert" &&
                      "bg-gradient-to-b from-red-300 to-red-200"
                    } ${
                      noti.status === "safe" &&
                      "bg-gradient-to-b from-green-200 to-green-100"
                    }`}
                  >
                    <h3 className="font-bold text-lg mb-2">{`Budget: ${noti.budgetId}`}</h3>
                    <p>
                      <strong>Status:</strong> <span>{noti.status}</span>
                    </p>
                    <p>
                      <strong>Total Expense:</strong> ${noti.totalExpense}
                    </p>
                    <p>
                      <strong>Remaining Gap:</strong> ${noti.gap}
                    </p>
                    <p>
                      <strong>Bar Color:</strong>{" "}
                      <span
                        style={{
                          display: "inline-block",
                          width: "20px",
                          height: "20px",
                          backgroundColor: noti.barColor,
                          borderRadius: "50%",
                          border: "1px solid #ccc",
                        }}
                      ></span>
                    </p>
                  </div>
                </AccordionContent>
              ))}
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
