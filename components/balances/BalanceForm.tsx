"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { Dispatch, SetStateAction, useState } from "react";
import { createBalance } from "@/lib/actions/balance.actions";

const balanceFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  currentBalance: z
    .number()
    .min(0, "Current balance must be greater than or equal to 0"),
});

export default function BalanceForm({
  setBalances,
}: {
  setBalances: Dispatch<SetStateAction<any>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        form.reset({
          name: "",
          currentBalance: 0,
        });
        setBalances((prev: any) => [...prev, response.balance]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to create balance:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger className="bg-black py-2 px-4 text-white rounded-lg">
        + New Balance
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New Balance</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter balance name" {...field} />
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
                  <FormLabel>Current Balance</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter starting balance"
                      {...field}
                      type="number"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-end">
              <div className="flex gap-4 items-center">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={isLoading}>
                  Submit
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
