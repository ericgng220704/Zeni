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
  categories,
  recurringTransactions,
  setRecurringTransaction,
}: {
  balanceId: string;
  user: User;
  categories: Category[];
  recurringTransactions: RecurringTransaction[];
  setRecurringTransaction: React.Dispatch<
    React.SetStateAction<RecurringTransaction[]>
  >;
}) {
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
                setRecurringTransaction((prev) => [...prev, transaction]);
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
            setRecurringTransaction((prev) =>
              prev.filter(
                (transaction: RecurringTransaction) =>
                  transaction.id !== deletedTransation.id
              )
            );
          }}
          onTransactionUpdated={(updatedTransaction) => {
            setRecurringTransaction((prev) =>
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
