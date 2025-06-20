"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Shadcn UI components for Form & Card.
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DynamicFormProps {
  message: string;
  props: Record<string, string>;
  callback: any;
}

export function InteractiveFormMessage({
  message,
  props,
  callback,
}: DynamicFormProps) {
  const dynamicSchema = z.object(
    Object.keys(props).reduce((acc, key) => {
      acc[key] = z.string().nonempty({ message: `${key} is required` });
      return acc;
    }, {} as Record<string, z.ZodTypeAny>)
  );

  // Initialize react-hook-form with the dynamic schema
  const form = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: props,
  });

  const onSubmit = (values: Record<string, string>) => {
    console.log("Submitted values:", values, "Callback:", callback);
    // TODO: Implement your callback handling logic here.
  };

  return (
    <Card className="my-4 shadow-md rounded-lg p-4 border border-gray-300">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{message}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {Object.keys(props).map((key) => (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{key}</FormLabel>
                    <FormControl>
                      <Input placeholder={key} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" className="mt-4">
              Submit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
