// app/components/ChatWindow.jsx
"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import Logo from "../Logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";

const formSchema = z.object({
  message: z.string(),
});

const suggestedQuestions = [
  "What is a balance in Zeni?",
  "How do I create a budget?",
  "What can I use Zeni for?",
  "How do recurring transactions work?",
];

export default function ChatWindow({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("question");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [step, setStep] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  // Refactored sendMessage now accepts a message parameter.
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Append user message immediately
    setMessages((prev) => [...prev, { sender: "user", text: message }]);

    // Show bot "typing" indicator
    setIsBotTyping(true);

    try {
      if (selectedModel === "question") {
        const response = await fetch("/api/chatbot/question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: message }),
        });

        const { success, resultText } = await response.json();

        if (!success) {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Error answering question" },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: resultText.content },
          ]);
        }
      } else {
        setStep("parsing given command...");
        const response = await fetch("/api/chatbot/command/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: message }),
        });

        const { success, resultJson } = await response.json();

        if (!success || !resultJson) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Sorry there is error in parsing your command, please try again!",
            },
          ]);
          setStep("");
          return;
        }

        const json = JSON.parse(resultJson);

        const response2 = await fetch("/api/chatbot/command/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ json }),
        });

        const result = await response2.json();

        if (!result.success) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: result.message,
            },
          ]);
        } else {
          if (json.action.includes("get")) {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: result.data,
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: result.message,
              },
            ]);
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: resultJson,
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing command:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setIsBotTyping(false);
    }
  };

  // onSubmit now passes the message directly to sendMessage.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const message = values.message;
    form.reset();
    await sendMessage(message);
  }

  return (
    <Card className="w-full pt-4 pb-6 h-[650px]">
      <CardContent className="h-full w-full">
        <div>
          <Select
            defaultValue="question"
            onValueChange={(value) => setSelectedModel(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="command">Command</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-between h-full w-full pt-4">
          <div>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-8">
                <Logo Clsname="" />
                <h2 className="text-lg my-1">Welcome to Zeni chatbot</h2>
                <span className="text-xs text-gray-600">
                  By ericgng@gmail.com
                </span>
                <div className="flex items-center gap-2 mt-6">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      className="p-4 border border-black/10 rounded-xl shadow-sm cursor-pointer text-sm"
                      key={index}
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-h-[520px] overflow-y-scroll">
                {messages.map((message, index) => (
                  <ChatMessage
                    type={message.sender === "user" ? "right" : "left"}
                    message={message.text}
                    user={user}
                    key={index}
                  />
                ))}
                {isBotTyping && (
                  <ChatMessage
                    type="left"
                    message=""
                    isLoading={isBotTyping}
                    user={user}
                    key="bot-typing"
                  />
                )}
              </div>
            )}
          </div>
          <div className="w-full px-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-2"
              >
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          placeholder={`Message ${selectedModel}`}
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Submit</Button>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
