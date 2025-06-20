"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Balance, Category, Transaction } from "@/type";
import { cn, formatNumber, getIconByName, hexToRgb } from "@/lib/utils";
import Link from "next/link";

interface TransactionListCardProps {
  data: {
    dataType: "transactions";
    action: string;
    transactions: Transaction[];
    categories: Category[];
  };
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}

export default function TransactionListCard({
  data,
}: TransactionListCardProps) {
  if (
    data.dataType !== "transactions" ||
    !data.transactions ||
    !data.categories
  ) {
    return null;
  }

  const { transactions, categories } = data;

  return (
    <Card className="min-w-[380px]">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>

      <CardContent>
        {transactions.length > 0 ? (
          <div className="">
            {transactions.map((tx) => {
              const category = categories.find((c) => c.id === tx.category_id);
              if (!category) return;
              return (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  category={category}
                />
              );
            })}

            <div className="w-full flex items-center justify-center mt-4">
              <Link
                href={"/expenses"}
                className="text-sm text-gray-600 hover:text-black"
              >
                see more...
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  category: Category;
}

function TransactionItem({ transaction, category }: TransactionItemProps) {
  const Icon = getIconByName(category.icon);

  return (
    <div
      style={{ backgroundColor: `rgba(${hexToRgb(category.color)}, 0.7)` }}
      className="mt-3 flex items-center justify-between bg-white px-4 py-2 rounded-xl shadow-[0_1px_3px_rgb(0,0,0,0.1)]"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-8 w-8 rounded-full p-1  flex items-center justify-center bg-gray-50 text-black/70 hover:"
          )}
        >
          <Icon size={16} />
        </div>
        <div className="text-gray-600">
          <p className="text-lg font-semibold">{category.name}</p>
        </div>
      </div>
      <div className="flex items-end flex-col gap-1">
        <p className="text-lg font-semibold">
          {transaction.type === "EXPENSE" ? "-" : null}$
          {formatNumber(transaction.amount)}
        </p>
      </div>
    </div>
  );
}
