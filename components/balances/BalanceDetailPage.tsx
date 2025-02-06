"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getIconByName, getInitials } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import UsersAreaStackChart from "../charts/AreaStackChartUsers";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Balance, Category, Transaction, User, UserMember } from "@/type";
import { loadBalanceDetailPage } from "@/lib/actions/initalLoad.actions";
import CategoryPieChart from "../charts/PieChartsCategoryTotals";
import { getUserByEmail } from "@/lib/actions/user.actions";
import BudgetManager from "../budgets/BudgetManager";
import { handleInviteBack } from "@/lib/actions/invitation.actions";
import TransactionRecurringManager from "../transactions/TransationRecurringManager";

export default function BalanceDetailPage({
  balanceId,
  user,
}: {
  user: any;
  balanceId: string;
}) {
  const [balance, setBalance] = useState<Balance>();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<UserMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, getErrorMessage] = useState("");

  useEffect(() => {
    async function initialLoad() {
      setIsLoading(true);
      const {
        success,
        balance,
        recentTransactions,
        userMembers,
        categoriesList,
      } = await loadBalanceDetailPage({
        balanceId,
        type: "ALL",
      });

      if (success) {
        setBalance(balance[0]);
        setRecentTransactions(recentTransactions);
        setCategories(categoriesList);
        setMembers(userMembers);
        setIsLoading(false);
      }
    }

    initialLoad();
  }, []);

  async function handleInvite() {
    if (!inviteEmail) return;

    setIsInviting(true);

    try {
      const { success, message } = await getUserByEmail(inviteEmail);

      if (!success) {
        getErrorMessage(message);
        return;
      }

      await handleInviteBack({
        email: inviteEmail,
        balanceId,
        inviterName: user.name,
      });

      setIsOpen(false);
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsInviting(false);
    }
  }

  if (isLoading || !balance) return <div></div>;

  return (
    <div className="px-2 md:px-5 lg:px-10">
      <div className="flex flex-col md:flex-row md:items-end gap-1 md:gap-4">
        <h1 className="h1">{balance.name}</h1>
        <Badge
          className="text-xs w-fit md:text-sm mb-1 bg-black/10"
          variant={"secondary"}
        >
          {balance.id}
        </Badge>
      </div>

      <div className="my-4">
        <p className="text-gray-600 text-sm md:text-sm my-4 max-w-[800px]">
          Welcome to your <strong>Balance Detail</strong> page!
          <br />
          Here, you can track your finances, analyze spending trends, and manage
          transactions in one place. View real-time insights through interactive
          charts, check recent transactions, and collaborate with other members
          by inviting them to join. Stay on top of your budget and make informed
          financial decisions with ease.
        </p>
      </div>

      <div className="flex justify-around flex-wrap my-8 ">
        <Card className="!p-0">
          <CardHeader className="font-semibold px-2 md:!px-8 !py-2 text-base md:text-lg">
            Total Expense:
          </CardHeader>
          <CardContent className="text-center text-red-400 font-bold !pb-2 md:!pb-4 text-sm md:text-lg">
            {balance.total_expense}
          </CardContent>
        </Card>
        <Card className="!p-0">
          <CardHeader className="font-semibold px-2 md:!px-8 !py-2 text-base md:text-lg">
            Current Balance:
          </CardHeader>
          <CardContent className="text-center font-bold !pb-2 md:!pb-4 text-sm md:text-lg">
            {balance.current_balance}
          </CardContent>
        </Card>
        <Card className="!p-0">
          <CardHeader className="font-semibold px-2 md:!px-8 !py-2 text-base md:text-lg">
            Total Income:
          </CardHeader>
          <CardContent className="text-center font-bold !pb-2 md:!pb-4 text-sm md:text-lg text-green-500">
            {balance.total_income}
          </CardContent>
        </Card>
      </div>

      <div className="my-4 flex flex-col gap-3 lg:grid lg:grid-cols-2">
        <UsersAreaStackChart balanceId={balanceId} uniquePayers={members} />

        <CategoryPieChart balanceId={balanceId} categories={categories} />
      </div>

      <div className="my-4 grid grid-cols-2 gap-3 lg:grid-cols-2">
        {/* <Card className="col-span-1 order-1">
          <CardHeader>
            <CardTitle className="h2 text-gray-400">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Badge
                className="flex items-center gap-2 w-fit text-base"
                variant="outline"
              >
                <span>Current Balance: </span>
                <span className="">{balance.current_balance}</span>
              </Badge>

              <Badge
                className="flex items-center gap-2 w-fit text-base"
                variant="outline"
              >
                <span>Total Expense: </span>
                <span className="text-red-400">{balance.total_expense}</span>
              </Badge>

              <Badge
                className="flex items-center gap-2 w-fit text-base"
                variant="outline"
              >
                <span>Total Income: </span>
                <span className="text-green-500">{balance.total_income}</span>
              </Badge>
            </div>
          </CardContent>
        </Card> */}

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
                          style={{ backgroundColor: user.color || undefined }}
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
                  <div className="w-full my-1 cursor-pointer hover:bg-gray-50 rounded-lg flex items-center justify-between">
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
                        {transaction.amount}
                      </span>
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}

            <div className="w-full flex items-center justify-center text-sm mt-2 text-gray-600">
              <Link
                href={"/expenses"}
                className="hover:underline hover:underline-offset-1"
              >
                See more...
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {balanceId && (
        <div className="my-4">
          <TransactionRecurringManager balanceId={balanceId} user={user} />
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
