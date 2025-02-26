"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useEffect, useRef, useState } from "react";
import { createBalance } from "@/lib/actions/balance.actions";
import Image from "next/image";
import { Progress } from "./ui/progress";
import { useRouter } from "next/navigation";
import { setNotNewUser } from "@/lib/actions/user.actions";

const balanceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currentBalance: z
    .number()
    .min(0, "Current balance must be greater than or equal to 0"),
});

export default function OnboardingDialog({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(user.isNewUser);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [balanceId, setBalanceId] = useState<string | null>(null);
  const router = useRouter();
  const totalStep = 3;

  useEffect(() => {
    if (step === 4 && balanceId) {
      router.push(`/balances/${balanceId}`);
    }
  }, [step, balanceId, router]);

  function handleNextStep() {
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else if (step === 3) {
      form.handleSubmit(onSubmit)();
    }
  }

  const form = useForm<z.infer<typeof balanceFormSchema>>({
    resolver: zodResolver(balanceFormSchema),
    defaultValues: {
      name: "",
      currentBalance: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof balanceFormSchema>) {
    try {
      setIsLoading(true);
      const response = await createBalance({
        name: values.name,
        currentBalance: values.currentBalance,
      });
      if (response.success) {
        setBalanceId(response.balance.id);
        setStep(4);
        const { success } = await setNotNewUser(user.id);
        if (!success) throw new Error("Something went wrong...");
      }
    } catch (error) {
      console.error("Failed to create balance:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-h-max pt-6 pb-4 flex flex-col justify-between">
        <AlertDialogHeader className="flex items-center justify-center">
          <Progress
            value={(step / totalStep) * 100}
            className="!h-[5px] mb-4"
          />
          <AlertDialogTitle className="text-center h1 !mb-4">
            {step === 1 && "Welcome to Zeni!"}
            {step === 2 && "What can you do?"}
            {step < 5 && step > 2 && "Let's Create Your First Balance"}
          </AlertDialogTitle>
          <div>
            {step === 1 && (
              <div className="flex items-center justify-center flex-col">
                <span className="text-sm font-semibold text-gray-600">
                  Meet Zeni V1 – a smart, intuitive expense management app
                  designed to help you take control of your finances
                  effortlessly.
                </span>
                <Image
                  src={"/welcome_cat.jpeg"}
                  alt="welcome cat"
                  height={400}
                  width={400}
                />
                <span className="text-xs text-gray-300">
                  *Image from
                  https://www.lummi.ai/3d/animated-cat-character-in-children's-attire-n04_n
                </span>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-3 items-center">
                  <Image
                    src={"/piggy_bank.jpeg"}
                    alt="staying on budget"
                    height={130}
                    width={130}
                    className="rounded-xl"
                  />
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold">
                      Staying on Budget:
                    </h4>
                    <p className="text-sm text-gray-700">
                      With smart alerts and data visualization, Zeni ensures
                      you’re always aware of your spending, making it easier to
                      stick to your financial goals.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <Image
                    src={"/bot.jpeg"}
                    alt="chatbot guidance"
                    height={130}
                    width={130}
                    className="rounded-xl"
                  />
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold">
                      Hands-Free Financial Management:
                    </h4>
                    <p className="text-sm text-gray-700">
                      Whether you’re at home or on the go, let the Zeni Chatbot
                      guide you. Follow its clear instructions or let it execute
                      commands for you—all in natural language.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <Image
                    src={"/share.jpeg"}
                    alt="shared expenses"
                    height={130}
                    width={130}
                    className="rounded-xl"
                  />
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold">
                      Managing Shared Expenses:
                    </h4>
                    <p className="text-sm text-gray-700">
                      Perfect for roommates or partners managing a shared
                      household budget. Use Zeni to track contributions and
                      settle up seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {step < 5 && step > 2 && (
              <div className="flex flex-col gap-4">
                <span className="text-gray-600 text-sm">
                  Your first balance will help you track your transactions and
                  organize your finances. Let's set it up so you can start
                  managing your money efficiently.
                </span>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter balance name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currentBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Current Balance{" "}
                            <span className="text-gray-600">(optional)</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter starting balance"
                              {...field}
                              type="number"
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </div>
            )}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction onClick={handleNextStep} className="w-full">
            {step === 1 && "Get started"}
            {step === 2 && "Next"}
            {step < 5 && step > 2 && !isLoading && "Create"}
            {step < 5 && step > 2 && isLoading && "Creating"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
