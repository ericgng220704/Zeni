"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { getBudgets } from "@/lib/actions/budget.actions";
import BudgetCard from "./BudgetCard";
import BudgetForm from "./BudgetForm";
import BudgetManager from "./BudgetManager";
import { Balance, Budget, Category, User } from "@/type";

export default function BudgetPage({
  balances,
  categories,
  user,
}: {
  balances: Balance[];
  categories: Category[];
  user: any;
}) {
  const [selectedBalance, setSelectedBalance] = useState<string>(
    user.defaultBalance || balances[0]?.id
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Budget[]>([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState<Budget[]>([]);
  const [customBudgets, setCustomBudgets] = useState<Budget[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh() {
    setRefreshKey((prev) => prev + 1);
  }

  useEffect(() => {
    async function fetchBudgets() {
      try {
        const { budgets, success } = await getBudgets({
          balanceId: selectedBalance,
        });

        if (!success) return;

        // Categorize budgets
        const categorized = budgets.reduce(
          (acc: any, budget: Budget) => {
            if (budget.type === "CATEGORY") {
              acc.category.push(budget);
            } else if (budget.type === "MONTHLY") {
              acc.monthly.push(budget);
            } else if (budget.type === "CUSTOM") {
              acc.custom.push(budget);
            }
            return acc;
          },
          { category: [], monthly: [], custom: [] }
        );

        setCategoryBudgets(categorized.category);
        setMonthlyBudgets(categorized.monthly);
        setCustomBudgets(categorized.custom);
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
      }
    }

    fetchBudgets();
  }, [selectedBalance, refreshKey]);

  function handleCreateBudget(newBudget: Budget) {
    if (newBudget.type === "CATEGORY") {
      setCategoryBudgets((prev) => [...prev, newBudget]);
    } else if (newBudget.type === "MONTHLY") {
      setMonthlyBudgets((prev) => [...prev, newBudget]);
    } else if (newBudget.type === "CUSTOM") {
      setCustomBudgets((prev) => [...prev, newBudget]);
    }

    triggerRefresh();
  }

  return (
    <div className="px-2 md:px-5 lg:px-10 mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex lg:items-center gap-2 flex-col lg:flex-row">
          <h1 className="h1 ">Budget</h1>
          <Select
            onValueChange={(value) => setSelectedBalance(value)}
            defaultValue={selectedBalance || ""}
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
          <BudgetForm
            balanceId={selectedBalance}
            categories={categories}
            onBudgetCreated={handleCreateBudget}
          />
        )}
      </div>

      {/* Budgets */}
      <div className="mt-6 space-y-8">
        <BudgetManager
          balanceId={selectedBalance}
          refreshKey={refreshKey}
          categories={categories}
        />

        <BudgetCard
          budgets={categoryBudgets}
          type="category"
          categories={categories}
          setBudgets={setCategoryBudgets}
          triggerRefresh={triggerRefresh}
        />
        <BudgetCard
          budgets={monthlyBudgets}
          type="monthly"
          categories={categories}
          setBudgets={setMonthlyBudgets}
          triggerRefresh={triggerRefresh}
        />
        <BudgetCard
          budgets={customBudgets}
          type="custom"
          categories={categories}
          setBudgets={setCustomBudgets}
          triggerRefresh={triggerRefresh}
        />
      </div>
    </div>
  );
}
