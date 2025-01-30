"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { deleteBalance, getUserBalances } from "@/lib/actions/balance.actions";
import { Badge } from "@/components/ui/badge";
import { MdDelete } from "react-icons/md";
import Link from "next/link";
import { Balance, User, UserBalance } from "@/type";

export default function BalanceCard({
  balance,
  setBalances,
}: {
  balance: Balance;
  setBalances: Dispatch<SetStateAction<Balance>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [owners, setOwners] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchMembership() {
      const userBalances = await getUserBalances(balance.id);

      if (userBalances.length === 0) return;

      const owners: any[] = [];
      const members: any[] = [];

      userBalances.map((userBalance: any) => {
        userBalance.role === "OWNER"
          ? owners.push(userBalance)
          : members.push(userBalance);
      });

      setOwners(owners);
      setMembers(members);
    }
    fetchMembership();
  }, []);

  async function handleDeleteBalance() {
    try {
      setIsLoading(true);

      const response = await deleteBalance(balance.id);
      if (!response.success) return;
      setBalances((prev: any) =>
        prev.filter((prev: any) => prev.id !== response.deletedBalance.id)
      );
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Link
            className="h3 hover:underline-offset-2 hover:underline"
            href={`/balances/${balance.id}`}
          >
            {balance.name}
          </Link>
          <div className="w-full flex justify-end">
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => handleDeleteBalance()}
                disabled={isLoading}
                variant={"ghost"}
                className="rounded-full"
              >
                <MdDelete />
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Badge
            className="flex items-center gap-2 w-fit text-sm"
            variant="outline"
          >
            <span>Current Balance: </span>
            <span className="">{balance.current_balance}</span>
          </Badge>

          <div className="flex items-center justify-between">
            <Badge
              className="flex items-center gap-2 w-fit text-sm"
              variant="outline"
            >
              <span>Total Expense: </span>
              <span className="text-red-400">{balance.total_expense}</span>
            </Badge>

            <Badge
              className="flex items-center gap-2 w-fit text-sm"
              variant="outline"
            >
              <span>Total Income: </span>
              <span className="text-green-500">{balance.total_income}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <Badge className="text-sm" variant="outline">
            Owners:
          </Badge>
          <div className="flex items-center gap-1">
            {owners.map((user: any, index: number) => (
              <Avatar key={index + user.id} className="size-6 text-xs">
                <AvatarImage src={`${user.image}`} />
                <AvatarFallback style={{ backgroundColor: user.color }}>
                  {getInitials(user.name, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        {members.length !== 0 && (
          <div className="flex items-center gap-2">
            <Badge className="text-sm" variant="outline">
              Members:
            </Badge>
            <div className="flex items-center gap-1">
              {members.map((user: any, index: number) => (
                <Avatar key={index + user.id} className="size-6 text-xs">
                  <AvatarImage src={`${user.image}`} />
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {getInitials(user.name, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
