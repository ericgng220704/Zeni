"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn, formatNumber, getIconByName, hexToRgb } from "@/lib/utils";
import {
  deleteTransaction,
  updateTransaction,
} from "@/lib/actions/transaction.actions";
import { Balance, Category, Transaction } from "@/type";
import { useToast } from "@/hooks/use-toast";

const transactionFormSchema = z.object({
  amount: z.number().min(0, "Amount must be greater than or equal to 0"),
  description: z.string().min(1, "Description is required"),
  date: z.date(),
  balanceId: z.string().min(1, "Balance ID is required"),
  categoryId: z.string().min(1, "Category ID is required"),
  type: z.string(),
});

interface TransactionEditFormProps {
  transaction: Transaction;
  balances: Balance[];
  categories: Category[];
  onTransactionUpdated: (updatedTransaction: any) => void;
  onTransactionDeleted: (deletedTransaction: any) => void;
  setIsOpen: (isOpen: boolean) => void;
}

function TransactionEditForm({
  transaction,
  balances,
  categories,
  onTransactionUpdated,
  onTransactionDeleted,
  setIsOpen,
}: TransactionEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: parseFloat(transaction.amount),
      description: transaction.note || undefined,
      date: new Date(transaction.date),
      balanceId: transaction.balance_id,
      categoryId: transaction.category_id,
      type: transaction.type,
    },
  });

  async function onSubmit(values: z.infer<typeof transactionFormSchema>) {
    try {
      setIsLoading(true);

      const { updatedTransaction, success, message } = await updateTransaction({
        transactionId: transaction.id,
        newAmount: values.amount,
        newDescription: values.description,
        newDate: values.date,
        newCategoryId: values.categoryId,
      });

      if (success) {
        onTransactionUpdated(updatedTransaction);
        setIsOpen(false);
        toast({
          description: message,
        });
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
      toast({
        variant: "destructive",
        description: "Oops something went wrong, please try again!",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteTransaction() {
    try {
      setIsLoading(true);

      const { success, message } = await deleteTransaction(transaction.id);

      if (success) {
        onTransactionDeleted(transaction.id);
        setIsOpen(false);
        toast({
          description: message,
        });
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
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
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder="amount"
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
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal ml-3",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        field.value.toLocaleDateString()
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balanceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a balance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {balances.map((balance) => (
                    <SelectItem value={balance.id} key={balance.id}>
                      {balance.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem value={category.id} key={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex items-center gap-2 justify-end">
          <Button
            disabled={isLoading}
            onClick={() => handleDeleteTransaction()}
            type="submit"
            variant={"ghost"}
            className="border border-black/20"
          >
            Delete
          </Button>
          <Button type="submit" disabled={isLoading}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  category: Category;
  balances: Balance[];
  categories: Category[];
  onTransactionUpdated: (updatedTransaction: any) => void;
  onTransactionDeleted: (deletedTransaction: any) => void;
}

export default function TransactionItem({
  transaction,
  category,
  balances,
  categories,
  onTransactionUpdated,
  onTransactionDeleted,
}: TransactionItemProps) {
  const Icon = getIconByName(category.icon);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          style={{ backgroundColor: `rgba(${hexToRgb(category.color)}, 0.7)` }}
          className="flex items-center justify-between bg-white px-4 py-2 rounded-xl cursor-pointer hover:!bg-white shadow-[0_3px_10px_rgb(0,0,0,0.1)]"
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-8 w-8 rounded-full p-1  flex items-center justify-center bg-gray-50 text-black/70 hover:"
              )}
            >
              <Icon size={16} />
            </div>
            <div className="text-gray-600">
              <p className="text-lg font-semibold">{category.name}</p>
            </div>
          </div>
          <div className="flex items-end flex-col gap-1">
            <p className="text-lg font-semibold">
              {transaction.type === "EXPENSE" ? "-" : null}$
              {formatNumber(transaction.amount)}
            </p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <TransactionEditForm
          transaction={transaction}
          balances={balances}
          categories={categories}
          onTransactionUpdated={onTransactionUpdated}
          onTransactionDeleted={onTransactionDeleted}
          setIsOpen={setIsOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
