import * as React from "react";
// Import Shadcn UI Card components – adjust the import path as needed.
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BalanceCardMessage from "./interactiveCardMessages/balanceCard";
import { FaCheck } from "react-icons/fa";
import { MdError } from "react-icons/md";
import UserBalanceCardMessage from "./interactiveCardMessages/UserBalanceCard";
import BudgetCardMessage from "./interactiveCardMessages/BudgetsCard";
import CategoryTotalsCard from "./interactiveCardMessages/CategoryTotalsCard";
import RecurringTransactionsCard from "./interactiveCardMessages/RecurringTransactionsCard";
import TransactionListCard from "./interactiveCardMessages/TransactionsCard";

interface DynamicCardProps {
  message: string;
  data?: any;
  subtype: "DISPLAY" | "ERROR" | "SUCCESS" | "";
}

export function InteractiveCardMessage({
  message,
  data,
  subtype,
}: DynamicCardProps) {
  let content;
  switch (data.dataType) {
    case "balance":
    case "balances": {
      content = <BalanceCardMessage data={data} subtype={subtype} />;
      break;
    }

    case "userBalances": {
      content = <UserBalanceCardMessage data={data} subtype={subtype} />;
      break;
    }

    case "budgets": {
      content = <BudgetCardMessage data={data} subtype={subtype} />;
      break;
    }

    case "categoryTotals": {
      content = <CategoryTotalsCard data={data} subtype={subtype} />;
      break;
    }

    case "recurringTransactions": {
      content = <RecurringTransactionsCard data={data} subtype={subtype} />;
      break;
    }

    case "transactions": {
      content = <TransactionListCard data={data} subtype={subtype} />;
      break;
    }

    default: {
      content = <div></div>;
      break;
    }
  }

  return (
    <Card className={`shadow-lg rounded-2xl py-2 border min-w-[350px]`}>
      <CardContent>
        <div className="mb-6 mt-2">
          <p>{message}</p>
        </div>
        {subtype === "SUCCESS" && (
          <div className="flex flex-col justify-center items-center w-full mb-4">
            <div className="p-4 rounded-full bg-green-400 flex items-center justify-center">
              <FaCheck className="w-6 h-6 text-gray-900" />
            </div>
            <span className="h2 text-green-600">Success</span>
          </div>
        )}
        {subtype === "ERROR" && (
          <div className="flex flex-col justify-center items-center w-full mb-4">
            <div className="p-3 rounded-full bg-red-500 flex items-center justify-center">
              <MdError className="w-8 h-8 text-white" />
            </div>
            <span className="h2 text-red-500">Error</span>
          </div>
        )}
        <div className="flex justify-center">{content}</div>
      </CardContent>
    </Card>
  );
}
