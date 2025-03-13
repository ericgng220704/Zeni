"use client";

import ChatWindow from "@/components/chatbot/ChatWindow";
import VersionList from "@/components/dashboard/VersionSetion";
import OnboardingDialog from "@/components/OnboardingDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Balance, Category, Transaction, ActivityLog } from "@/type";
import { initiate } from "@/lib/actions/dashboard.actions";
import OverviewTab from "./OverviewTab";

export default function DashboardPage({ user }: { user: any }) {
  const { toast } = useToast();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch dashboard data once the session is available.
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      const {
        success,
        balanceList,
        categoryList,
        categoryTotalList,
        recentTransactionList,
        activityList,
      } = await initiate(user.id);
      if (!success) {
        toast({ description: "Oops something went wrong" });
        setIsLoading(false);
        return;
      }
      setBalances(balanceList);
      setCategories(categoryList);
      setCategoryTotals(categoryTotalList);
      setRecentTransactions(recentTransactionList);
      setActivities(activityList);
      setIsLoading(false);
    }
    if (user) {
      initData();
    }
  }, [user]);

  return (
    <main className="main-container px-2 md:px-5 lg:px-10 mb-12">
      <h1 className="h1">Dashboard</h1>
      <Tabs defaultValue="overview" className="w-full my-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot🔥</TabsTrigger>
          <TabsTrigger value="analytic">Version</TabsTrigger>
        </TabsList>
        <TabsContent value="analytic">
          <VersionList />
        </TabsContent>
        <TabsContent value="chatbot">
          <ChatWindow user={user} />
        </TabsContent>
        <TabsContent value="overview">
          {!isLoading && (
            <OverviewTab
              user={user}
              balances={balances}
              categories={categories}
              categoryTotals={categoryTotals}
              recentTransactions={recentTransactions}
              activities={activities}
            />
          )}
        </TabsContent>
      </Tabs>
      <OnboardingDialog user={user} />
    </main>
  );
}
