"use client";

import {
  Balance,
  Category,
  RecurringTransaction,
  Transaction,
  UserMember,
} from "@/type";
import UsersAreaStackChart from "../charts/AreaStackChartUsers";
import CategoryPieChart from "../charts/PieChartsCategoryTotals";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatNumber, getIconByName, getInitials } from "@/lib/utils";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Link from "next/link";
import TransactionRecurringManager from "../transactions/TransationRecurringManager";
import BudgetManager from "../budgets/BudgetManager";
import React from "react";

export default function OverviewTab({
  balance,
  user,
  recentTransactions,
  members,
  categories,
  recurringTransactions,
  setRecurringTransaction,
  inviteEmail,
  setInviteEmail,
  isOpen,
  setIsOpen,
  errorMessage,
  handleInvite,
  isInviting,
}: {
  balance: Balance;
  user: any;
  recentTransactions: Transaction[];
  members: UserMember[];
  categories: Category[];
  recurringTransactions: RecurringTransaction[];
  setRecurringTransaction: React.Dispatch<
    React.SetStateAction<RecurringTransaction[]>
  >;
  inviteEmail: string;
  setInviteEmail: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  errorMessage: string;
  handleInvite: () => Promise<void>;
  isInviting: boolean;
}) {
  const balanceId = balance.id;

  return (
    <div>
      <div className="my-6 flex flex-col gap-3 lg:grid lg:grid-cols-2">
        <UsersAreaStackChart balanceId={balanceId} uniquePayers={members} />

        <CategoryPieChart balanceId={balanceId} categories={categories} />
      </div>

      <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-2">
        <Card className="lg:col-span-1 col-span-2 lg:order-3 order-2">
          <CardHeader>
            <CardTitle className="h2 text-gray-400">Members</CardTitle>
          </CardHeader>
          <CardContent>
            {members.map((user: UserMember) => (
              <div key={user.id}>
                <div className="w-full my-1 cursor-pointer hover:bg-gray-50 rounded-lg">
                  <div className="flex items-end overflow-hidden justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8 text-sm">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback
                          style={{
                            backgroundColor: user.color || undefined,
                          }}
                        >
                          {getInitials(user.name, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.email}</span>
                    </div>

                    <div>
                      <span className="text-sm text-gray-600">
                        {user.role.toLocaleLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
          {members.find((member) => member.id === user.id)?.role ===
            "OWNER" && (
            <CardFooter className="w-full">
              <Dialog
                open={isOpen}
                onOpenChange={() => setIsOpen((prev) => !prev)}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">+ Invite</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invite other users</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="flex items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    {errorMessage !== "" && (
                      <div>
                        <p className="text-red-300">{errorMessage}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? "Inviting..." : "Invite"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          )}
        </Card>

        <Card className="lg:col-span-1 col-span-2 order-3 lg:order-2">
          <CardHeader>
            <CardTitle className="h2 text-gray-400">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.map((transaction: Transaction) => {
              const category = categories.filter(
                (category) => category.id === transaction.category_id
              )[0];
              const Icon = getIconByName(category.icon);
              return (
                <div key={transaction.id}>
                  <div className="w-full my-1 hover:bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Avatar className="size-8 text-sm">
                        <AvatarFallback
                          style={{
                            backgroundColor: category.color,
                          }}
                        >
                          <Icon size={14} className="text-gray-500" />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <div>
                      <span
                        className={
                          transaction.type === "EXPENSE"
                            ? "text-red-400"
                            : "text-green-500"
                        }
                      >
                        {formatNumber(transaction.amount)}
                      </span>
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}

            <div className="w-full flex items-center justify-center text-sm mt-2 text-gray-600">
              <Link
                href={`/expenses/${balance.id}`}
                className="hover:underline hover:underline-offset-1"
              >
                See more...
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {balanceId && (
        <div className="my-6">
          <TransactionRecurringManager
            balanceId={balanceId}
            user={user}
            categories={categories}
            recurringTransactions={recurringTransactions}
            setRecurringTransaction={setRecurringTransaction}
          />
        </div>
      )}

      {categories && (
        <div className="my-4">
          <BudgetManager
            balanceId={balanceId}
            refreshKey={1}
            categories={categories}
          />
        </div>
      )}
    </div>
  );
}
