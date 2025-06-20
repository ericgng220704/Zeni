"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getIconByName } from "@/lib/utils";
import { RecurringTransaction, Category } from "@/type";

// helper to convert ms-string into days/hours text
function formatInterval(msStr: string) {
  const ms = Number(msStr);
  const days = ms / 86400000;
  if (days >= 1 && Number.isInteger(days)) {
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  const hours = ms / 3600000;
  return `${Math.round(hours)} hour${hours > 1 ? "s" : ""}`;
}

export default function RecurringTransactionsCard({
  data,
  subtype,
}: {
  data: {
    dataType: "recurringTransactions";
    action: "get_recurring_transactions_by_balance";
    recurringTransactions: RecurringTransaction[];
    categories: Category[];
  };
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}) {
  if (
    data.dataType !== "recurringTransactions" ||
    !data.recurringTransactions ||
    !data.categories
  ) {
    return null;
  }

  return (
    <Card className="min-w-[380px]">
      <CardHeader className="flex flex-col justify-center items-center">
        <div className="flex items-center gap-8">
          <div className="text-center sm:text-left">
            <CardTitle>Recurring Transactions</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {data.recurringTransactions.length > 0 ? (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recurringTransactions.map((tx) => {
                  const cat = data.categories.find(
                    (c) => c.id === tx.category_id
                  );
                  const Icon = getIconByName(cat?.icon || "");
                  return (
                    <TableRow
                      key={tx.id}
                      className={
                        tx.status === "ACTIVE"
                          ? ""
                          : "!text-gray-400 hover:!bg-white"
                      }
                    >
                      <TableCell className="flex items-center gap-2">
                        {Icon && <Icon size={16} className="text-gray-500" />}
                        {cat?.name ?? "N/A"}
                      </TableCell>
                      <TableCell>{formatInterval(tx.interval)}</TableCell>
                      <TableCell
                        className={
                          tx.status === "ACTIVE"
                            ? "text-green-600"
                            : "text-gray-400"
                        }
                      >
                        {tx.status}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {tx.amount}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex items-center justify-center text-center h-full">
            <p>No recurring transactions.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
