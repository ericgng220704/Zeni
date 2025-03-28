"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatNumber, getInitials } from "@/lib/utils";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { deleteBalance, getUserBalances } from "@/lib/actions/balance.actions";
import { MdDelete } from "react-icons/md";
import Link from "next/link";
import { Balance } from "@/type";
import { useToast } from "@/hooks/use-toast";

export default function BalanceCard({
  balance,
  setBalances,
}: {
  balance: Balance;
  setBalances: Dispatch<SetStateAction<Balance>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMembership() {
      const userBalances = await getUserBalances(balance.id);

      if (userBalances.length === 0) return;
      setMembers(userBalances);
    }
    fetchMembership();
  }, []);

  async function handleDeleteBalance() {
    try {
      setIsLoading(true);

      const response = await deleteBalance(balance.id);
      if (!response.success) {
        toast({
          variant: "destructive",
          description: response.message || "Failed to delete balance",
        });
        return;
      }
      toast({
        description: response.message || "Balance deleted successfully",
      });
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
    <Card className="w-full max-w-[800px]">
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-3">
          <Link
            className="text-xl font-semibold hover:underline-offset-2 hover:underline"
            href={`/balances/${balance.id}`}
          >
            {balance.name}
          </Link>

          <div className="flex gap-4 items-center">
            <Button
              onClick={() => handleDeleteBalance()}
              disabled={isLoading}
              variant={"ghost"}
              className="rounded-full border border-black/20 hover:bg-stone-50"
            >
              <MdDelete />
              <span>Delete</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around flex-wrap mb-8">
          <Card className="!p-0">
            <CardHeader className=" px-2 md:!px-8 !py-2 text-base">
              Total Expense:
            </CardHeader>
            <CardContent className="text-center text-red-400 font-bold !pb-2 md:!pb-4 text-sm md:text-lg">
              {formatNumber(balance.total_expense)}
            </CardContent>
          </Card>
          <Card className="!p-0">
            <CardHeader className=" px-2 md:!px-8 !py-2 text-base ">
              Current Balance:
            </CardHeader>
            <CardContent className="text-center font-bold !pb-2 md:!pb-4 text-sm md:text-lg">
              {formatNumber(balance.current_balance)}
            </CardContent>
          </Card>
          <Card className="!p-0">
            <CardHeader className="px-2 md:!px-8 !py-2 text-base">
              Total Income:
            </CardHeader>
            <CardContent className="text-center font-bold !pb-2 md:!pb-4 text-sm md:text-lg text-green-500">
              {formatNumber(balance.total_income)}
            </CardContent>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div>
          {members.length !== 0 && (
            <div className="flex items-center">
              <div className="flex items-center">
                {members.map((user: any, index: number) => (
                  <Avatar
                    key={index + user.id}
                    className="size-7 text-xs border-2 border-white -ml-2"
                  >
                    <AvatarImage src={`${user.image}`} />
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {getInitials(user.name, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <Link
            className="text-sm bg-black text-white py-1 px-4 rounded-2xl hover:bg-black/80"
            href={`/balances/${balance.id}`}
          >
            View Detail
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
