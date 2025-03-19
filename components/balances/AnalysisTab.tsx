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
}: AnalysisTabProps) {
  let tips: string[] = [];
  if (personalTip) {
    tips = JSON.parse(personalTip.tips_json || "[]");
  }

  // If analysis is enabled and data has been loaded, render the analysis content.
  if (analysisEnabled) {
    return forecast && personalTip ? (
      <Card>
        <CardHeader />
        <CardContent>
          <div className="flex items-center justify-between gap-4 sm:flex-row flex-col">
            <Card className="rounded-3xl">
              <CardContent
                className="!my-0 !mx-0 !px-0 !py-0 rounded-2xl overflow-hidden"
                style={{ backgroundColor: user.color }}
              >
                <ChatBot />
              </CardContent>
            </Card>
            <div className="flex-grow">
              <h2 className="text-lg font-semibold mb-2">
                AI Generated Advices
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
            <ForecastLinearChart forecast={forecast} user={user} />
          </div>
        </CardContent>
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
          <Button onClick={() => setAnalysisDialogOpen(true)}>
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
                <span className="text-black font-semibold">3 balances</span>.
              </span>
            </DialogDescription>
            <div className="flex items-center gap-4 justify-end">
              <Button onClick={enableAnalysis} disabled={analysisIsEnabling}>
                {analysisIsEnabling ? "Enabling..." : "Enable"}
              </Button>
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
