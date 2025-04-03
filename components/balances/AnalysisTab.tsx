"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Balance, Forecast, PersonalTips } from "@/type";
import { Button } from "../ui/button";
import Image from "next/image";
import { TextShimmerWave } from "../motion-primitives/text-shimmer-wave";
import ChatBot from "../chatbot/ChatBot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextScramble } from "../motion-primitives/text-scramble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ForecastLinearChart } from "../charts/ForecastLinearChart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaRedo } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import { CiStreamOff } from "react-icons/ci";
import { CiStreamOn } from "react-icons/ci";
import { useToast } from "@/hooks/use-toast";
import { getCurrentMonthDates } from "@/lib/utils";
import {
  calculateForecast,
  disableForecast,
} from "@/lib/actions/forecast.actions";
import { generateTips } from "@/lib/actions/personalTip.actions";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { getAnalysisEnabledBalances } from "@/lib/actions/balance.actions";

interface AnalysisTabProps {
  balance: Balance;
  user: any;
  analysisEnabled: boolean;
  analysisIsEnabling: boolean;
  analysisIsInitialAnalyzing: boolean;
  analysisDialogOpen: boolean;
  setAnalysisDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  analysisMessage: string;
  forecast?: Forecast;
  personalTip?: PersonalTips;
  enableAnalysis: () => Promise<void>;
  setForecast: React.Dispatch<React.SetStateAction<Forecast | undefined>>;
  setPersonalTip: React.Dispatch<
    React.SetStateAction<PersonalTips | undefined>
  >;
  setAnalysisEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AnalysisTab({
  balance,
  user,
  analysisEnabled,
  analysisIsEnabling,
  analysisIsInitialAnalyzing,
  analysisDialogOpen,
  setAnalysisDialogOpen,
  analysisMessage,
  forecast,
  personalTip,
  enableAnalysis,
  setForecast,
  setPersonalTip,
  setAnalysisEnabled,
}: AnalysisTabProps) {
  let tips: string[] = [];
  if (personalTip) {
    tips = JSON.parse(personalTip.tips_json || "[]");
  }

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [enabledBalances, setEnableBalances] = useState<any[]>();
  const { toast } = useToast();

  async function handleDisable() {
    try {
      await disableForecast(balance.id);
      setAnalysisEnabled(false);
      toast({
        description: "Disable Analysis feature successfully!",
      });
    } catch {
      toast({
        description: "Failed to disable Analysis feature!",
        variant: "destructive",
      });
    }
  }

  async function calculateEnableBalances() {
    try {
      setIsCalculating(true);
      const { success, balances } = await getAnalysisEnabledBalances(user.id);
      if (!success) {
        return;
      }
      setEnableBalances(balances);
    } catch {
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleReAnalysis() {
    try {
      setIsAnalyzing(true);
      const { first, last } = getCurrentMonthDates();
      const { success, forecast } = await calculateForecast({
        balanceId: balance.id,
        startDate: first,
        endDate: last,
        periodType: "MONTH",
      });

      const result = await generateTips(balance.id);

      if (!success || !result.success) {
        toast({
          description: "Failed to perform the new Analysis!",
          variant: "destructive",
        });
        return;
      }

      setForecast({ ...forecast[0] });
      setPersonalTip({ ...result.result[0] });
      toast({
        description: "The new Analysis is ready!",
      });
    } catch {
      toast({
        description: "Failed to perform the new Analysis!",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }

  // If analysis is enabled and data has been loaded, render the analysis content.
  if (analysisEnabled) {
    return forecast && personalTip ? (
      <Card className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center justify-center rounded-full absolute top-2 right-4 hover:bg-zinc-100 py-1 px-2">
              <BsThreeDots className="text-lg text-gray-600 hover:text-black" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="absolute -right-4 max-w-[230px]">
            {/* <Separator className="w-full " /> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full" asChild>
                  <button
                    className="flex items-center justify-between w-full text-sm group hover:bg-zinc-100 py-2 px-1 rounded-lg"
                    onClick={handleDisable}
                  >
                    <span>Turn off Analysis</span>
                    <CiStreamOn className="text-lg text-gray-600 group-hover:!text-black group-hover:hidden" />
                    <CiStreamOff className="text-lg text-gray-600 group-hover:!text-black group-hover:inline-flex hidden" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Disable analysis feature of this balance</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator className="w-full my-1" />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="w-full" asChild>
                  <button
                    className="flex items-center justify-between w-full text-sm group hover:bg-zinc-100 py-2 px-1 rounded-lg"
                    onClick={handleReAnalysis}
                  >
                    <span>Generate new Analysis </span>
                    <FaRedo className="font-thin text-sm text-gray-600 group-hover:!text-black group-hover:rotate-45 transition-all duration-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate new Analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PopoverContent>
        </Popover>

        <CardHeader />
        <CardContent>
          <div className="flex items-center justify-between gap-4 sm:flex-row flex-col">
            <Card className="rounded-3xl">
              <CardContent
                className="!my-0 !mx-0 !px-0 !py-0 rounded-2xl h-60 sm:w-56 sm:h-72 overflow-hidden"
                style={{ backgroundColor: user.color }}
              >
                <ChatBot />
              </CardContent>
            </Card>
            <div className="flex-grow">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span>AI Generated Advices</span>{" "}
                <span
                  className="cursor-pointer !font-thin"
                  onClick={() => handleReAnalysis()}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {" "}
                        <FaRedo className="font-thin text-sm text-gray-600 hover:text-black hover:rotate-45 transition-all duration-300" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate new analysis</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </span>
              </h2>
              <ScrollArea className="h-64 w-full rounded-xl border p-4">
                {tips.map((tip: string, index: number) => (
                  <div key={index} className="mb-2">
                    <TextScramble
                      className="font-mono text-sm"
                      duration={1.2}
                      characterSet=". "
                    >
                      {(index + 1).toString() + ". " + tip}
                    </TextScramble>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>
          <Tabs defaultValue="summary" className="mt-4">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="detail">Detail</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="text-sm sm:text-base">
              {personalTip.summarized_analysis}
            </TabsContent>
            <TabsContent value="detail" className="text-sm sm:text-base">
              {personalTip.detailed_analysis}
            </TabsContent>
          </Tabs>
          <div className="mt-8 lg:px-10">
            {forecast && user && (
              <ForecastLinearChart forecast={forecast} user={user} />
            )}
          </div>
        </CardContent>
        <AlertDialog open={isAnalyzing}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Just a Moment!</AlertDialogTitle>
              <AlertDialogDescription>
                We're analyzing your data. It should only take a few moments, so
                thanks for hanging in there....
              </AlertDialogDescription>
            </AlertDialogHeader>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    ) : null;
  }

  // Otherwise, show the prompt to enable analysis.
  return (
    <div>
      <Card className="flex flex-col items-center justify-center">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            Analysis Feature Disabled
          </CardTitle>
          <CardDescription>
            Enable analysis to unlock forecasting and gain insightful data for
            your balance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="/analysis.jpg"
            alt="Illustration showing analysis features"
            height={300}
            width={300}
          />
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => {
              setAnalysisDialogOpen(true);
              calculateEnableBalances();
            }}
          >
            Enable Analysis
          </Button>
        </CardFooter>
      </Card>
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg">
              {analysisIsInitialAnalyzing ? (
                <TextShimmerWave className="font-mono text-sm" duration={1}>
                  {analysisMessage}
                </TextShimmerWave>
              ) : (
                "Enable Analysis Function?"
              )}
            </DialogTitle>
            <DialogDescription className="flex flex-col gap-4">
              <span className="text-base">
                Once activated, you’ll gain access to advanced forecasting and
                data insights.
              </span>
              <span className="italic">
                Please note that each account can only have analysis enabled on
                up to{" "}
                <span className="text-black font-semibold">
                  {enabledBalances ? 3 - enabledBalances.length : "..."}{" "}
                  balances
                </span>
                .
              </span>
              <span className="flex flex-col gap-2">
                <span>Enabled Balances:</span>
                {enabledBalances
                  ? enabledBalances.map((balance: any, index: number) => {
                      return (
                        <span className="text-xs" key={index}>
                          {index + 1}. {balance.balanceName} (
                          {balance.balanceId.slice(0, 12)}...)
                        </span>
                      );
                    })
                  : "Loading..."}
              </span>
              {enabledBalances && enabledBalances.length === 3 && (
                <span className="text-sm text-red-400">
                  You have reached the maximum limit of analyzable balances.
                  Please disable one of your currently enabled balances to
                  continue.
                </span>
              )}
            </DialogDescription>
            <div className="flex items-center gap-4 justify-end">
              {enabledBalances && enabledBalances.length === 3 ? (
                <Button disabled>Enable</Button>
              ) : (
                <Button
                  onClick={enableAnalysis}
                  disabled={isCalculating || analysisIsEnabling}
                >
                  {analysisIsEnabling ? "Enabling..." : "Enable"}
                </Button>
              )}
              <Button
                variant={"outline"}
                onClick={() => setAnalysisDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
