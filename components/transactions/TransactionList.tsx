import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TransactionItem from "./TransactionItem";
import { useState } from "react";
import { Balance, Category, Transaction } from "@/type";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  balances: Balance[];
  onTransactionUpdated: (transaction: any) => void;
  onTransactionDeleted: (transaction: any) => void;
}

export default function TransactionList({
  transactions,
  categories,
  balances,
  onTransactionUpdated,
  onTransactionDeleted,
}: TransactionListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date"); // Track selected sort option

  // Create a category lookup map
  const categoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<string, Category>);

  // Enhance transactions with category details
  const enhancedTransactions = transactions.map((transaction) => ({
    ...transaction,
    category: categoryMap[transaction.category_id],
  }));

  // Filter transactions by selected category
  const filteredTransactions =
    selectedCategory && selectedCategory !== "all"
      ? enhancedTransactions.filter(
          (transaction) => transaction.category?.id === selectedCategory
        )
      : enhancedTransactions;

  // Sort transactions based on selected sort option
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === "value") {
      return parseFloat(b.amount) - parseFloat(a.amount);
    }
    return 0;
  });

  // Group transactions by date
  const groupedTransactions = sortedTransactions.reduce(
    (acc: any, transaction) => {
      const dateObj = new Date(transaction.date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        weekday: "short", // e.g., "Tue"
        month: "short", // e.g., "Jan"
        day: "2-digit", // e.g., "07"
        year: "numeric", // e.g., "2025"
      });
      if (!acc[formattedDate]) {
        acc[formattedDate] = [];
      }
      acc[formattedDate].push(transaction);
      return acc;
    },
    {}
  );

  // Convert grouped transactions to an array and sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {/* Category Filter */}
        <Select
          onValueChange={(value) => setSelectedCategory(value)}
          defaultValue="all"
        >
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((category, index) => (
              <SelectItem key={index} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select onValueChange={(value) => setSortBy(value)} defaultValue="date">
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="value">Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-6 mt-2">
        {sortedDates.map((date) => (
          <div key={date}>
            {/* Date Header */}
            <h3 className="text-gray-500 mb-3 text-sm md:text-base">{date}</h3>

            {/* Transactions for the Date */}
            <div className="space-y-2 flex flex-col gap-1">
              {groupedTransactions[date].map((transaction: Transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  category={
                    categories.filter(
                      (category: Category) =>
                        category.id === transaction.category_id
                    )[0]
                  }
                  balances={balances}
                  categories={categories}
                  onTransactionUpdated={onTransactionUpdated}
                  onTransactionDeleted={onTransactionDeleted}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
