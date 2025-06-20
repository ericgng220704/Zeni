"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiArrowUpRight } from "react-icons/fi";
import { Tilt } from "@/components/motion-primitives/tilt";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function BudgetCardMessage({
  data,
  subtype,
}: {
  data: any;
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}) {
  if (data.dataType !== "budget" || data.action !== "create_budget") {
    return null;
  }

  const { budget } = data as {
    dataType: "budget";
    action: "create_budget";
    budget: {
      balance_id: string;
      type: string;
      name?: string | null;
      amount: string;
      start_date: string;
      end_date: string | null;
      status: string;
    };
  };

  const BudgetCard = (b: typeof budget) => (
    <Tilt rotationFactor={8} key={b.balance_id}>
      <Card
        className={cn(
          "w-fit px-1 shadow-[5px_5px_0px_0px_rgba(109,40,217)]",
          subtype === "SUCCESS" && "!shadow-[5px_5px_0px_0px_rgba(74,222,128)]"
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-1">
            <CardTitle className="text-lg">{b.name ?? "New Budget"}</CardTitle>
            <FiArrowUpRight />
          </div>
          <span className="text-xs text-gray-600">Balance: {b.balance_id}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pl-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Type</span>
            <span>{b.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Amount</span>
            <span>${parseFloat(b.amount).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Period</span>
            <span>
              {format(new Date(b.start_date), "MMM dd, yyyy")} –{" "}
              {b.end_date ? format(new Date(b.end_date), "MMM dd, yyyy") : "∞"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status</span>
            <span>{b.status}</span>
          </div>
        </CardContent>
      </Card>
    </Tilt>
  );

  return <>{BudgetCard(budget)}</>;
}
