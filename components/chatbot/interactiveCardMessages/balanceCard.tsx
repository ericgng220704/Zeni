import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiArrowUpRight } from "react-icons/fi";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaArrowTrendDown } from "react-icons/fa6";
import { Balance } from "@/type";
import Link from "next/link";
import { Tilt } from "@/components/motion-primitives/tilt";
import { cn, formatNumber } from "@/lib/utils";

export default function BalanceCardMessage({
  data,
  subtype,
}: {
  data: any;
  subtype: "SUCCESS" | "ERROR" | "DISPLAY" | "";
}) {
  if (data.dataType !== "balance" && data.dataType !== "balances") return null;
  const isDeleted = data.action ? data.action === "delete_balance" : false;

  const BalanceCard = (balance: Balance) => (
    <Tilt rotationFactor={8} key={balance.id}>
      <Card
        className={cn(
          "w-fit px-1 shadow-[5px_5px_0px_0px_rgba(109,40,217)]",
          subtype === "SUCCESS" &&
            !isDeleted &&
            "!shadow-[5px_5px_0px_0px_rgba(74,222,128)]",
          isDeleted && "!shadow-[5px_5px_0px_0px_rgba(75,85,99)] bg-gray-100"
        )}
      >
        <CardHeader>
          <Link
            href={isDeleted ? "#" : `/balances/${balance.id}`}
            className={cn(
              "flex items-center gap-1 transition-all",
              isDeleted
                ? " cursor-default"
                : " cursor-pointer hover:underline hover:underline-offset-4"
            )}
          >
            <CardTitle className="text-lg">{balance.name}</CardTitle>
            <div className="flex items-center justify-center p-1">
              <FiArrowUpRight />
            </div>
          </Link>
          <span className="text-xs text-gray-600">{balance.id}</span>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pl-9">
          <div className="flex items-center">
            <div className="w-6">
              <div className="ml-1 w-[2.5px] h-3 bg-gray-600"></div>
            </div>
            <div>Current Balance: {formatNumber(balance.current_balance)}</div>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowTrendUp className="text-gray-600 w-4 h-4" />
            <div>Total Income: {formatNumber(balance.total_income)}</div>
          </div>
          <div className="flex items-center gap-2">
            <FaArrowTrendDown className="text-gray-600 w-4 h-4" />
            <div>Total Expense: {formatNumber(balance.total_expense)}</div>
          </div>
        </CardContent>
      </Card>
    </Tilt>
  );

  if (data.dataType === "balances") {
    return (
      <div className="flex flex-col gap-6">
        {data.balances &&
          data.balances.map((balance: Balance) => BalanceCard(balance))}
      </div>
    );
  } else {
    return BalanceCard(data.balance);
  }
}
