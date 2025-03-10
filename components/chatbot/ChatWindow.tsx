// app/components/ChatWindow.jsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import InstructionCard from "./InstructionCard";

const formSchema = z.object({
  message: z.string(),
});

const suggestedQuestions = [
  "What is a balance in Zeni?",
  "How do I create a budget?",
  "What can I use Zeni for?",
  "How do recurring transactions work?",
];

const suggestedCommands = [
  "Add a $50 expense for groceries on Monday.",
  "Show me the last 10 expense transactions for the balance named 'Savings'.",
  "Get category totals for my 'Daily Expenses' balance.",
];

export default function ChatWindow({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("question");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [step, setStep] = useState("");
  const [botLimit, setBotLimit] = useState(user.chatbotLimit);

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
          body: JSON.stringify({ input: message, userId: user.id }),
        });

        const { success, resultText, currentLimit } = await response.json();

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
          setBotLimit(currentLimit.toString());
        }
      } else {
        setStep("parsing given command...");
        const response = await fetch("/api/chatbot/command/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: message, userId: user.id }),
        });

        const { success, resultJson, currentLimit } = await response.json();

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

        setBotLimit(currentLimit.toString());

        const json = JSON.parse(resultJson);

        console.log(json);

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
            { sender: "bot", text: result.message },
          ]);
        } else {
          const refineResponse = await fetch("/api/chatbot/command/refine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userPrompt: message,
              processedResult: result.data || result.message,
              action: json.action,
            }),
          });
          const refineResult = await refineResponse.json();
          if (!refineResult.success) {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: "Error refining result: " + (refineResult.message || ""),
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: refineResult.refinedMessage,
              },
            ]);
          }
        }
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
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
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
            <HoverCard>
              <HoverCardTrigger>
                <div className=" cursor-default  flex items-center justify-center h-5 w-5 text-sm bg-gray-100 rounded-full text-gray-600">
                  i
                </div>
              </HoverCardTrigger>
              <HoverCardContent align="start">
                <InstructionCard type={selectedModel} />
              </HoverCardContent>
            </HoverCard>
          </div>
          <div>
            <p
              className={cn(
                parseFloat(botLimit) < 10 ? "text-red-400" : "text-gray-600",
                "text-sm"
              )}
            >
              <span className="!text-gray-600 text-xs md:text-sm">
                {" "}
                Your chatbot limit is
              </span>{" "}
              {botLimit}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-between h-full w-full pt-4">
          <div>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-8">
                <Logo Clsname="" />
                <h2 className="text-lg my-1">Welcome to Zeni chatbot</h2>
                <span className="text-xs text-gray-600">
                  Model: gpt-mini-4o
                </span>
                <div
                  className={cn(
                    `!grid !grid-cols-2 md:!flex md:!items-center gap-2 mt-6`,
                    parseFloat(botLimit) === 0 ? "hidden" : "flex"
                  )}
                >
                  {selectedModel === "question"
                    ? suggestedQuestions.map((question, index) => (
                        <button
                          className="p-4 border border-black/10 rounded-xl shadow-sm cursor-pointer text-sm"
                          key={index}
                          onClick={() => sendMessage(question)}
                        >
                          {question}
                        </button>
                      ))
                    : suggestedCommands.map((question, index) => (
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
          <div className="w-full lg:px-8 md:px-2 px-1">
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
                          placeholder={
                            parseFloat(botLimit) === 0
                              ? "Sorry, your chatbot limit has been reached."
                              : `Message "${selectedModel}"`
                          }
                          {...field}
                          className="h-10"
                          disabled={parseFloat(botLimit) === 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={parseFloat(botLimit) === 0}>
                  Submit
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
