"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecurringTransactions } from "@/lib/actions/recurringTransaction.actions";
import { Category, RecurringTransaction, User } from "@/type";
import { useEffect, useState } from "react";
import RecurringTransactionsTable from "./TransactionRecurringTable";
import { getCategories } from "@/lib/actions/category.actions";
import RecurringTransactionForm from "./TransactionRecurringForm";

export default function TransactionRecurringManager({
  balanceId,
  user,
}: {
  balanceId: string;
  user: User;
}) {
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      const { transactions, success } = await getRecurringTransactions(
        balanceId
      );

      const categories = await getCategories();

      if (!success) return;
      setRecurringTransactions(transactions);
      setCategories(categories);
    }

    fetchTransactions();
  }, [balanceId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between gap-12">
          <CardTitle>Recurring Transactions</CardTitle>
          <div>
            <RecurringTransactionForm
              user={user}
              balanceId={balanceId}
              categories={categories}
              onTransactionCreated={(transaction) => {
                setRecurringTransactions((prev) => [...prev, transaction]);
              }}
            />
          </div>
        </div>

        <CardDescription>
          Automate your regular payments and transfers with recurring
          transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-700 mb-5">
          <p>
            Recurring transactions help you schedule and automate frequent
            expenses, such as subscription fees, utility bills, or savings
            contributions.
            <br />
            <strong>Example use cases:</strong> Automating monthly rent or
            utility payments, managing subscription services, or setting up
            regular transfers to your savings account.
          </p>
        </div>

        <RecurringTransactionsTable
          recurringTransactions={recurringTransactions}
          onTransactionDeleted={(deletedTransation) => {
            setRecurringTransactions((prev) =>
              prev.filter(
                (transaction: RecurringTransaction) =>
                  transaction.id !== deletedTransation.id
              )
            );
          }}
          onTransactionUpdated={(updatedTransaction) => {
            setRecurringTransactions((prev) =>
              prev.map((transaction) =>
                transaction.id === updatedTransaction.id
                  ? updatedTransaction
                  : transaction
              )
            );
          }}
          categories={categories}
        />
      </CardContent>
    </Card>
  );
}
