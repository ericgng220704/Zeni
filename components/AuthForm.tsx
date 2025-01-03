"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "./OTPmodal";

type FormType = "sign-in" | "sign-up";

const authFormSchema = (formType: FormType) => {
  return z.object({
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
    email: z.string().email(),
  });
};

export default function AuthForm({ type }: { type: FormType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);

  // 1. Define your form.
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const user =
        type === "sign-up"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
            })
          : await signInUser({ email: values.email });

      setAccountId(user.accountId);
    } catch (e) {
      setErrorMessage("Failed to create account. Please try again");
    } finally {
      setIsLoading(false);
    }
  }
  console.log(accountId);
  return (
    <div className="min-w-[400px] sm:min-w-[500px]">
      <h1 className="text-4xl text-center lg:text-5xl font-bold mb-6">
        {type === "sign-in" ? "Sign In" : "Sign Up"}{" "}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex items-center justify-center">
            <Button type="submit" disabled={isLoading}>
              Submit
            </Button>
          </div>

          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "sign-in"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium"
            >
              {" "}
              {type === "sign-in" ? "Sign Up" : "Sign In"}
            </Link>
          </div>

          {accountId && (
            <OtpModal email={form.getValues("email")} accountId={accountId} />
          )}
        </form>
      </Form>
    </div>
  );
}
