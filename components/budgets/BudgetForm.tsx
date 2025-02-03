"use client";

import React, { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBudget } from "@/lib/actions/budget.actions";
import { Category } from "@/type";

const budgetFormSchema = z.object({
  type: z.enum(["CATEGORY", "MONTHLY", "CUSTOM"]),
  categoryId: z.string().optional(),
  name: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  month: z.number().optional(),
  year: z.number().optional(),
});

export default function BudgetForm({
  balanceId,
  categories,
  onBudgetCreated,
}: {
  balanceId: string;
  categories: Category[];
  onBudgetCreated: (budget: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      type: "CATEGORY",
      amount: 1,
      startDate: new Date(),
    },
  });

  // Update startDate dynamically based on type
  useEffect(() => {
    const type = form.watch("type");
    if (type === "CATEGORY") {
      form.setValue("startDate", new Date());
    } else if (type === "MONTHLY") {
      const firstDayOfCurrentMonth = new Date();
      firstDayOfCurrentMonth.setDate(1);
      form.setValue("startDate", firstDayOfCurrentMonth);
    }
  }, [form.watch("type")]);

  async function onSubmit(values: z.infer<typeof budgetFormSchema>) {
    try {
      setIsLoading(true);

      if (values.type === "CATEGORY" && values.categoryId === undefined) {
        values.categoryId = "cc9a19ac-efec-459f-8186-9ae681007325";
      }

      const { success, budget } = await createBudget({
        type: values.type,
        balanceId,
        categoryId: values.categoryId,
        name: values.name,
        amount: values.amount,
        startDate: values.startDate || new Date(),
        endDate: values.endDate,
        month: values.month,
      });

      if (success) {
        onBudgetCreated(budget);
        form.reset({
          type: "CATEGORY",
          amount: 1,
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to create budget:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button>Create Budget</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Budget</AlertDialogTitle>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a budget type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CATEGORY">Category</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "CATEGORY" && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("type") === "CUSTOM" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter budget name"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "MONTHLY" && (
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Period <span className="text-gray-600">(months)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="May leave blank for indefinite period"
                        type="number"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") !== "MONTHLY" && (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="w-full flex justify-end gap-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
