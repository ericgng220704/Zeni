// app/context/ChatbotContext.tsx
"use client";

import { getMessages, saveMessage } from "@/lib/actions/messages.actions";
import { LocalMessage } from "@/type";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface ChatbotContextType {
  messages: LocalMessage[];
  setMessages: React.Dispatch<React.SetStateAction<LocalMessage[]>>;
  sendMessage: (message: string, model?: string) => Promise<void>;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  isBotTyping: boolean;
  chatbotLimit: number;
  setChatbotLimit: React.Dispatch<React.SetStateAction<number>>;
  fetchHistory: () => Promise<void>;
  hasMore: boolean;
  refetchCount: number;
  currentStep: string;
  setCurrentStep: React.Dispatch<React.SetStateAction<string>>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
  user: any;
}

export function ChatbotProvider({ children, user }: ChatbotProviderProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("question");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatbotLimit, setChatbotLimit] = useState<number>(
    parseFloat(user.chatbotLimit)
  );
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refetchCount, setRefetchCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("Idle");

  // Function to fetch conversation history from the database
  const fetchHistory = async () => {
    try {
      const data = await getMessages({
        userId: user.id,
        page,
        limit: 10,
      });
      if (data.success) {
        // Map each fetched message to a LocalMessage by omitting the id field
        const localMessages = data.messages
          .map(({ id, ...rest }: any) => rest)
          .reverse();
        // Prepend older messages so that the history appears at the top of the chat
        setMessages((prev) => [...localMessages, ...prev]);
        setHasMore(data.hasMore);
        setPage(page + 1);
        setRefetchCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  // Optionally, fetch initial history on mount.
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (
    message: string,
    model: string = selectedModel
  ) => {
    if (!message.trim()) return;

    // Append user's message locally
    const newMessage: LocalMessage = {
      user_id: user.id,
      sender: "user",
      message: message,
      created_at: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Save message in the DB in the background
    await saveMessage({
      userId: user.id,
      sender: "user",
      message: message,
    });
    setIsBotTyping(true);

    try {
      if (model === "question") {
        const response = await fetch("/api/chatbot/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: message,
            userId: user.id,
            history: messages,
          }),
        });
        const data = await response.json();
        if (!data.success) {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: "Error answering question",
              created_at: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: data.resultText.content,
              created_at: new Date(),
            },
          ]);
          setChatbotLimit(data.currentLimit);
        }
      } else {
        // ---- Craft Step ----
        setCurrentStep("Crafting command");
        const craftResponse = await fetch("/api/chatbot/command/craft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: message,
            userId: user.id,
            history: messages,
          }),
        });
        const craftData = await craftResponse.json();
        console.log(craftData.command);
        if (!craftData.success || !craftData.command) {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: "Error crafting command",
              created_at: new Date(),
            },
          ]);
          setCurrentStep("Idle");
          return;
        }
        const craftedCommand = craftData.command;
        setChatbotLimit(craftData.currentLimit);

        // ---- Parse Step ----
        setCurrentStep("Parsing command");
        const parseResponse = await fetch("/api/chatbot/command/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: craftedCommand,
            userId: user.id,
            history: messages,
          }),
        });
        const parseData = await parseResponse.json();
        if (!parseData.success || !parseData.resultJson) {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: "Error parsing command",
              created_at: new Date(),
            },
          ]);
          setCurrentStep("Idle");
          return;
        }
        const json = JSON.parse(parseData.resultJson);

        // ---- Process Step ----
        setCurrentStep("Processing command");
        const processResponse = await fetch("/api/chatbot/command/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json, user }),
        });
        const processData = await processResponse.json();

        // ---- Refine Step ----
        setCurrentStep("Refining result");
        const refineResponse = await fetch("/api/chatbot/command/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPrompt: message,
            processedResult: processData.data || processData.message,
            action: json.action,
            userId: user.id,
            history: messages,
          }),
        });
        const refineData = await refineResponse.json();
        if (!refineData.success) {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: "Error refining result",
              created_at: new Date(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: refineData.refinedMessage,
              created_at: new Date(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          user_id: user.id,
          sender: "bot",
          message: "Sorry, something went wrong.",
          created_at: new Date(),
        },
      ]);
    } finally {
      setIsBotTyping(false);
      setCurrentStep("Idle");
    }
  };

  return (
    <ChatbotContext.Provider
      value={{
        messages,
        setMessages,
        sendMessage,
        selectedModel,
        setSelectedModel,
        isBotTyping,
        chatbotLimit,
        setChatbotLimit,
        fetchHistory,
        hasMore,
        refetchCount,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
