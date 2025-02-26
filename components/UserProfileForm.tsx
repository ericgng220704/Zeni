"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getBalances } from "@/lib/actions/balance.actions";
import { updateUserProfile } from "@/lib/actions/user.actions";
import { useToast } from "@/hooks/use-toast";

// Define the validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  color: z.string().min(3, { message: "Color must be at least 3 characters." }),
  defaultBalance: z.string().nullable(),
});

export function ProfileForm({ user }: { user: User }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [color, setColor] = useState<any>(user.color);
  const [balances, setBalances] = useState<any>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchBalances() {
      const balances = await getBalances();
      setBalances(balances);
    }

    fetchBalances();
  }, [user]);

  // Initialize the form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      color: user.color,
      defaultBalance: user.default_balance || null,
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsUpdating(true);
    try {
      const { success } = await updateUserProfile({
        name: values.name,
        color: values.color,
        defaultBalanceId: values.defaultBalance || undefined,
        userId: user.id,
      });

      if (success) {
        toast({
          description: "Successfully update user profile",
        });
      } else {
        toast({
          variant: "destructive",
          description: "Failed to update user profile",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to update user profile",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Name (Editable) */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormDescription>
                Your display name for the profile.
              </FormDescription>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormDescription>
            This is your registered email address.
          </FormDescription>
          <FormControl>
            <Input
              value={user.email || undefined}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </FormControl>
        </FormItem>

        {/* Color (Editable) */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormDescription>
                Your preferred color for the profile.
              </FormDescription>
              <div className="w-full flex items-center gap-1">
                <FormControl className="">
                  <Input
                    placeholder="Favorite Color"
                    {...field}
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      field.onChange(e.target.value);
                    }}
                  />
                </FormControl>
                <span
                  className="rounded-md h-9 w-9"
                  style={{
                    backgroundColor: color,
                  }}
                ></span>
              </div>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="defaultBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Balance</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value || null);
                }}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a balance" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {balances.map((balance: any) => (
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

        {/* Submit Button */}
        <div className="w-full flex items-center justify-end">
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
