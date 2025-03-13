"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  Balance,
  Category,
  Forecast,
  PersonalTips,
  Transaction,
  UserMember,
} from "@/type";
import {
  loadAnalysisTab,
  loadBalanceDetailPage,
} from "@/lib/actions/initalLoad.actions";
import { getUserByEmail } from "@/lib/actions/user.actions";
import { handleInviteBack } from "@/lib/actions/invitation.actions";
import { getUserBalances } from "@/lib/actions/balance.actions";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnalysisTab from "./AnalysisTab";
import OverviewTab from "./OverviewTab";

import {
  calculateForecast,
  enableForecast,
} from "@/lib/actions/forecast.actions";
import { getCurrentMonthDates } from "@/lib/utils";
import { generateTips } from "@/lib/actions/personalTip.actions";

export default function BalanceDetailPage({
  balanceId,
  user,
}: {
  user: any;
  balanceId: string;
}) {
  // Overview states
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
  const { toast } = useToast();

  // Analysis states
  const [analysisEnabled, setAnalysisEnabled] = useState<boolean>(false);
  const [analysisIsEnabling, setAnalysisIsEnabling] = useState<boolean>(false);
  const [analysisIsInitialAnalyzing, setAnalysisIsInitialAnalyzing] =
    useState<boolean>(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState<boolean>(false);
  const [analysisMessage, setAnalysisMessage] = useState<string>(
    "Great! We are calculating your very first Analysis.."
  );
  const [forecast, setForecast] = useState<Forecast>();
  const [personalTip, setPersonalTip] = useState<PersonalTips>();

  // Initial load for balance detail and overview data.
  useEffect(() => {
    async function initialLoad() {
      setIsLoading(true);
      const {
        success,
        balance: balanceData,
        recentTransactions,
        userMembers,
        categoriesList,
      } = await loadBalanceDetailPage({
        balanceId,
        type: "ALL",
      });

      if (success) {
        const loadedBalance = balanceData[0];
        setBalance(loadedBalance);
        setRecentTransactions(recentTransactions);
        setCategories(categoriesList);
        setMembers(userMembers);
        setAnalysisEnabled(loadedBalance.is_forecasting_enabled);
        setIsLoading(false);
      }
    }
    initialLoad();
  }, [balanceId]);

  // Fetch analysis data if balance is loaded and analysis is enabled.
  useEffect(() => {
    async function fetchAnalysisData() {
      if (balance && analysisEnabled && !forecast && !personalTip) {
        const {
          success,
          forecast: fetchedForecast,
          personalTip: fetchedPersonalTip,
        } = await loadAnalysisTab(balance.id);
        if (!success) return;
        setForecast(fetchedForecast);
        setPersonalTip(fetchedPersonalTip);
      }
    }
    fetchAnalysisData();
  }, [balance, analysisEnabled, forecast, personalTip]);

  // Function to perform initial analysis (forecast & tips)
  async function initialAnalysis() {
    try {
      setAnalysisIsInitialAnalyzing(true);
      const { first, last } = getCurrentMonthDates();
      const forecastResponse = await calculateForecast({
        userId: user.id,
        balanceId: balance!.id,
        startDate: first,
        endDate: last,
        periodType: "MONTH",
      });
      if (!forecastResponse.success) {
        setAnalysisMessage(
          "Oops! Something went wrong while calculating your initial forecast."
        );
        return;
      }
      setAnalysisMessage(
        `${forecastResponse.message} Generating your personalized advice...`
      );
      const tipResponse = await generateTips(user.id, balance!.id);
      if (!tipResponse.success) {
        setAnalysisMessage(
          "Oops! Something went wrong. Failed to generate tips."
        );
        return;
      }
      setForecast(forecastResponse.forecast);
      setPersonalTip(tipResponse.result);
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          "Oops! Something went wrong while performing the initial forecast.",
      });
    } finally {
      setAnalysisIsInitialAnalyzing(false);
    }
  }

  // Function to enable the analysis feature.
  async function enableAnalysis() {
    try {
      setAnalysisIsEnabling(true);
      const response = await enableForecast(balance!.id);
      if (!response.success) {
        toast({
          variant: "destructive",
          description: "Oops! Something went wrong. Failed to enable Analysis.",
        });
      } else {
        setAnalysisEnabled(true);
        await initialAnalysis();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Oops! Something went wrong. Failed to enable Analysis.",
      });
    } finally {
      setAnalysisIsEnabling(false);
      setAnalysisDialogOpen(false);
    }
  }

  // Function to handle inviting a new user (remains in Overview).
  async function handleInvite() {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const { success, message } = await getUserByEmail(inviteEmail);
      if (!success) {
        getErrorMessage(message);
        return;
      }
      const userMembers = await getUserBalances(balanceId);
      const existedUser = userMembers.find(
        (user: UserMember) => user.email === inviteEmail
      );
      if (existedUser) {
        getErrorMessage("This user already joined the balance.");
        return;
      }
      const response = await handleInviteBack({
        email: inviteEmail,
        balanceId,
        inviterName: user.name,
        balance,
      });
      if (response.success) {
        toast({ description: response.message });
      } else {
        toast({ variant: "destructive", description: response.message });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({ variant: "destructive", description: "Error inviting user" });
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

      <div className="flex justify-around flex-wrap mt-8 mb-16">
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

      <Tabs defaultValue="overview" className="">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab
            balance={balance}
            user={user}
            recentTransactions={recentTransactions}
            members={members}
            categories={categories}
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            errorMessage={errorMessage}
            handleInvite={handleInvite}
            isInviting={isInviting}
          />
        </TabsContent>
        <TabsContent value="analysis">
          <AnalysisTab
            balance={balance}
            user={user}
            analysisEnabled={analysisEnabled}
            analysisIsEnabling={analysisIsEnabling}
            analysisIsInitialAnalyzing={analysisIsInitialAnalyzing}
            analysisDialogOpen={analysisDialogOpen}
            setAnalysisDialogOpen={setAnalysisDialogOpen}
            analysisMessage={analysisMessage}
            forecast={forecast}
            personalTip={personalTip}
            enableAnalysis={enableAnalysis}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
