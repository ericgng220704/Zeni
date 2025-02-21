"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
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
import { updateBudget } from "@/lib/actions/budget.actions";
import { Budget, Category } from "@/type";
import { useToast } from "@/hooks/use-toast";

const editBudgetFormSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().optional(),
  amount: z.number().min(1, "Amount must be greater than 0"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  month: z.number().optional(),
  year: z.number().optional(),
});

export default function EditBudgetForm({
  budget,
  categories,
  onBudgetUpdated,
}: {
  budget: Budget;
  categories: Category[];
  onBudgetUpdated: (updatedBudget: any) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof editBudgetFormSchema>>({
    resolver: zodResolver(editBudgetFormSchema),
    defaultValues: {
      categoryId: budget.category_id || "",
      name: budget.name || "",
      amount: parseFloat(budget.amount),
      startDate: budget.start_date ? new Date(budget.start_date) : undefined,
      endDate: budget.end_date ? new Date(budget.end_date) : undefined,
      month: budget.month || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof editBudgetFormSchema>) {
    try {
      setIsLoading(true);

      const updates: Record<string, any> = {
        amount: values.amount,
        name: values.name,
        categoryId: values.categoryId,
        month: values.month,
        year: values.year,
      };

      if (values.startDate) {
        updates.startDate = values.startDate.toISOString();
      }

      if (values.endDate) {
        updates.endDate = values.endDate.toISOString();
      }

      const { updatedBudget, success, message } = await updateBudget({
        budgetId: budget.id,
        updates,
      });
      if (success) {
        toast({
          description: message,
        });
        onBudgetUpdated(updatedBudget);
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    } catch (error) {
      console.error("Failed to update budget:", error);
      toast({
        variant: "destructive",
        description: "Oops something went wrong, please try again!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Display the budget type as read-only */}
        <FormItem className="">
          <FormLabel>Budget Type:</FormLabel>
          <span className="font-semibold text-base ml-3 text-gray-700">
            {budget.type}
          </span>
        </FormItem>

        {budget.type === "CATEGORY" && (
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

        {budget.type === "CUSTOM" && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter budget name" {...field} />
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

        {/* Add fields for startDate and endDate */}
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
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
