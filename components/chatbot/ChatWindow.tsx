"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BsThreeDotsVertical } from "react-icons/bs";
import { IoTrashBin } from "react-icons/io5";
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
import { useChatbot } from "./ChatBotContext";
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
import { useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { clearMessageByUserId } from "@/lib/actions/messages.actions";

const formSchema = z.object({
  message: z.string(),
});

const suggestedQuestions = [
  "What is a balance in Zeni?",
  "How do I create a budget?",
  "What can I use Zeni for?",
  "How do recurring transactions work?",
];

// Helper: group messages by date.
function groupMessagesByDate(messages: any) {
  return messages.reduce((groups: Record<string, any[]>, message: any) => {
    const dateKey = new Date(message.created_at).toLocaleDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(message);
    return groups;
  }, {});
}

export default function ChatWindow({ user }: { user: any }) {
  const {
    messages,
    setMessages,
    sendMessage,
    selectedModel,
    setSelectedModel,
    isBotTyping,
    chatbotLimit,
    fetchHistory,
    hasMore,
    refetchCount,
    currentStep,
  } = useChatbot();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Ref to track if initial trigger has been skipped.
  const initialLoadRef = useRef(true);
  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const message = values.message;
    form.reset();
    await sendMessage(message);
  }

  // Group messages by date.
  const groupedMessages = groupMessagesByDate(messages);
  const sortedDates = Object.keys(groupedMessages).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Auto-scroll to bottom on new messages (unless older messages were just prepended).
  useEffect(() => {
    const container = scrollableDivRef.current;
    if (container && refetchCount > 1) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Intersection Observer to trigger fetching older messages.
  useEffect(() => {
    const container = scrollableDivRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          if (initialLoadRef.current) {
            // Skip the very first trigger.
            initialLoadRef.current = false;
            return;
          }
          const oldHeight = container.scrollHeight;
          await fetchHistory();
          const newHeight = container.scrollHeight;
          container.scrollTop = newHeight - oldHeight + container.scrollTop;
        }
      },
      {
        root: container,
        threshold: 1.0,
      }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [fetchHistory, hasMore]);

  const handleClearMessage = async () => {
    try {
      const { success, message } = await clearMessageByUserId(user.id);
      if (success) {
        toast({
          description: message,
        });
        setMessages([]);
      }
    } catch (e) {
      console.log(e);
      toast({
        description: "Failed to clear Message!",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full pt-1 pb-6 h-full !rounded-none">
      <CardContent className="h-full w-full">
        {/* Header */}
        <div className="w-full flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Logo Clsname="!text-2xl" LogoTxt="Zeni Bot" />
              <HoverCard>
                <HoverCardTrigger>
                  <div className="cursor-default flex items-center justify-center h-5 w-5 bg-gray-100 rounded-full text-gray-600 text-sm">
                    i
                  </div>
                </HoverCardTrigger>
                <HoverCardContent align="start">
                  <InstructionCard type={selectedModel} />
                </HoverCardContent>
              </HoverCard>
            </div>
            <p
              className={cn(
                parseFloat(chatbotLimit.toString()) < 10
                  ? "text-red-400"
                  : "text-gray-600",
                "text-sm"
              )}
            >
              <span className="!text-gray-600 text-xs">
                Your chatbot limit is {chatbotLimit}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2  mr-4">
            <Select
              defaultValue={selectedModel}
              onValueChange={(value) =>
                setSelectedModel(value as "question" | "command")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="command">Command</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center !px-0 !-mx-1">
                {" "}
                <BsThreeDotsVertical className="text-lg font-thin text-gray-600" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="flex items-center gap-2 !text-sm hover:bg-gray-100"
                  onClick={handleClearMessage}
                >
                  <IoTrashBin className="text-gray-600" />
                  <span>Clear</span>
                </DropdownMenuItem>
                {/* <DropdownMenuSeparator /> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Chat History and Input */}
        <div className="flex flex-col justify-between h-full w-full pt-4">
          <div
            id="scrollableDiv"
            ref={scrollableDivRef}
            className="h-[600px] overflow-y-auto"
          >
            {/* Sentinel for infinite scrolling */}
            <div ref={sentinelRef} className="h-2"></div>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-8">
                <Logo Clsname="" />
                <h2 className="text-lg my-1">Welcome to Zeni chatbot</h2>
                <span className="text-xs text-gray-600">
                  Model: gpt-mini-4o
                </span>
                <div
                  className={cn(
                    "!grid !grid-cols-2 gap-2 mt-6",
                    parseFloat(chatbotLimit.toString()) === 0
                      ? "hidden"
                      : "flex"
                  )}
                >
                  {selectedModel === "question" &&
                    suggestedQuestions.map((question, index) => (
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
              <>
                {sortedDates.map((date) => (
                  <div key={date}>
                    <div className="text-center text-gray-500 text-xs my-2">
                      {date}
                    </div>
                    {groupedMessages[date].map((msg: any, idx: number) => (
                      <ChatMessage
                        key={msg.id || idx}
                        type={msg.sender === "user" ? "right" : "left"}
                        message={msg.message}
                        user={user}
                      />
                    ))}
                  </div>
                ))}
                {isBotTyping && (
                  <ChatMessage
                    type="left"
                    message=""
                    isLoading={isBotTyping}
                    user={user}
                    currentStep={currentStep}
                    selectedModel={selectedModel}
                    key="bot-typing"
                  />
                )}
              </>
            )}
          </div>
          {/* Message Input */}
          <div className="w-full lg:px-4 md:px-2 px-1 mb-3">
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
                            parseFloat(chatbotLimit.toString()) === 0
                              ? "Sorry, your chatbot limit has been reached."
                              : `Message "${selectedModel}"`
                          }
                          {...field}
                          className="h-10"
                          disabled={parseFloat(chatbotLimit.toString()) === 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={parseFloat(chatbotLimit.toString()) === 0}
                >
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
