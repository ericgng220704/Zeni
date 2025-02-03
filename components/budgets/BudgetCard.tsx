"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import EditBudgetForm from "./BudgetEditForm";
import BudgetTable from "./BudgetTable";
import { Budget, Category } from "@/type";

export default function BudgetCard({
  budgets,
  type,
  categories,
  setBudgets,
  triggerRefresh,
}: {
  budgets: Budget[];
  categories: Category[];
  type: string;
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  triggerRefresh: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget>();

  return (
    <Card className="max-w-[1100px]">
      <div className="flex flex-col lg:grid lg:grid-cols-5">
        <CardHeader className="lg:col-span-2">
          <CardTitle className="">
            Budget {capitalizeFirstLetter(type)}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {type === "category" && (
              <div className="flex flex-col gap-1 my-2">
                <p>
                  This budget tracks expenses for a specific category, helping
                  you manage spending in areas like groceries, entertainment, or
                  utilities.
                </p>
                <span>
                  Example use cases: Controlling dining-out expenses or
                  monitoring travel costs.
                </span>
              </div>
            )}

            {type === "monthly" && (
              <div className="flex flex-col gap-1 my-2">
                <p>
                  This budget manages overall spending over a period by months,
                  ideal for planning monthly expenses across all categories.
                </p>
                <span>
                  Example use cases: Setting a $2000 limit for February or
                  balancing income and expenses monthly.
                </span>
              </div>
            )}

            {type === "custom" && (
              <div className="flex flex-col gap-1 my-2">
                <p>
                  This budget is tailored for unique or one-time purposes,
                  allowing you to define the name, amount, and time range.
                </p>
                <span>
                  Example use cases: Planning for a vacation, wedding, or
                  emergency savings.
                </span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="lg:col-span-3 lg:pt-8 lg:pb-4 pb-7">
          {type === "category" && budgets.length > 0 && (
            <BudgetTable
              budgets={budgets}
              setIsOpen={setIsOpen}
              setSelectedBudget={setSelectedBudget}
              type="CATEGORY"
              onBudgetCreated={(updatedBudget) => {
                setBudgets((prev) =>
                  prev.map((budget) =>
                    budget.id === updatedBudget.id ? updatedBudget : budget
                  )
                );

                triggerRefresh();
              }}
              onBudgetDeleted={(deletedBudget) => {
                setBudgets((prev) =>
                  prev.filter((budget) =>
                    budget.id === deletedBudget.id ? false : true
                  )
                );
                triggerRefresh();
              }}
              categories={categories}
            />
          )}
          {type === "monthly" && budgets.length > 0 && (
            <BudgetTable
              budgets={budgets}
              setIsOpen={setIsOpen}
              setSelectedBudget={setSelectedBudget}
              type="MONTHLY"
              onBudgetCreated={(updatedBudget) => {
                setBudgets((prev) =>
                  prev.map((budget) =>
                    budget.id === updatedBudget.id ? updatedBudget : budget
                  )
                );
                triggerRefresh();
              }}
              onBudgetDeleted={(deletedBudget) => {
                setBudgets((prev) =>
                  prev.filter((budget) =>
                    budget.id === deletedBudget.id ? false : true
                  )
                );

                triggerRefresh();
              }}
              categories={categories}
            />
          )}
          {type === "custom" && budgets.length > 0 && (
            <BudgetTable
              budgets={budgets}
              setIsOpen={setIsOpen}
              setSelectedBudget={setSelectedBudget}
              type="CUSTOM"
              onBudgetCreated={(updatedBudget) => {
                setBudgets((prev) =>
                  prev.map((budget) =>
                    budget.id === updatedBudget.id ? updatedBudget : budget
                  )
                );
                triggerRefresh();
              }}
              onBudgetDeleted={(deletedBudget) => {
                setBudgets((prev) =>
                  prev.filter((budget) =>
                    budget.id === deletedBudget.id ? false : true
                  )
                );
                triggerRefresh();
              }}
              categories={categories}
            />
          )}
        </CardContent>
      </div>
      <CardFooter className="">
        <p className="text-sm font-medium">Total Budgets: {budgets.length}</p>
      </CardFooter>
      <Dialog
        open={isOpen && selectedBudget !== undefined}
        onOpenChange={() => setIsOpen((prev) => !prev)}
      >
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>

            {selectedBudget && (
              <EditBudgetForm
                budget={selectedBudget}
                categories={categories}
                onBudgetUpdated={(updatedBudget) => {
                  setBudgets((prev) =>
                    prev.map((budget) =>
                      budget.id === updatedBudget.$id ? updatedBudget : budget
                    )
                  );
                  triggerRefresh();
                  setIsOpen(false);
                }}
              />
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
