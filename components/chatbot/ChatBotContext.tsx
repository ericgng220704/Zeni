"use client";

import { getMessages, saveMessage } from "@/lib/actions/messages.actions";
import { LocalMessage, MessageContent } from "@/type"; // ensure LocalMessage.message is typed as MessageContent
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

  // Fetch conversation history from the database.
  const fetchHistory = async () => {
    try {
      const data = await getMessages({
        userId: user.id,
        page,
        limit: 10,
      });
      if (data.success) {
        // Map fetched messages (omitting the id field) and reverse their order.
        const localMessages = data.messages
          .map(({ id, ...rest }: any) => rest)
          .reverse();
        setMessages((prev) => [...localMessages, ...prev]);
        setHasMore(data.hasMore);
        setPage(page + 1);
        setRefetchCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error);
    }
  };

  // Optionally, fetch the initial conversation history on mount.
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (
    message: string,
    model: string = selectedModel
  ) => {
    if (!message.trim()) return;

    // Wrap the user's plain text into a TextMessage structure.
    const userMessage: LocalMessage = {
      user_id: user.id,
      sender: "user",
      message: { type: "text", content: message } as MessageContent,
      created_at: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Save the user's message in the database in the background.
    await saveMessage({
      userId: user.id,
      sender: "user",
      message: { type: "text", content: message },
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
              message: { type: "text", content: "Error answering question" },
              created_at: new Date(),
            },
          ]);
        } else {
          // Assume the returned content is a TextMessage in data.resultText.
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: data.resultText as MessageContent,
              created_at: new Date(),
            },
          ]);
          setChatbotLimit(data.currentLimit);
        }
      } else {
        // For "command" mode, follow the command steps up until processing.
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
              message: { type: "text", content: "Error crafting command" },
              created_at: new Date(),
            },
          ]);
          setCurrentStep("Idle");
          return;
        }
        const craftedCommand = craftData.command;
        setChatbotLimit(craftData.currentLimit);

        // Parse Step.
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
        console.log(parseData);
        if (!parseData.success || !parseData.resultJson) {
          setMessages((prev) => [
            ...prev,
            {
              user_id: user.id,
              sender: "bot",
              message: { type: "text", content: "Error parsing command" },
              created_at: new Date(),
            },
          ]);
          setCurrentStep("Idle");
          return;
        }
        // Convert the parsed JSON to an object.
        const json = JSON.parse(parseData.resultJson);

        // Process Step – notice that we removed the refine stage.
        setCurrentStep("Processing command");
        const processResponse = await fetch("/api/chatbot/command/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ json, user }),
        });
        const processData = await processResponse.json();
        console.log(processData);
        // Assume processData is already in the new MessageContent format.
        setMessages((prev) => [
          ...prev,
          {
            user_id: user.id,
            sender: "bot",
            message: processData as MessageContent,
            created_at: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setMessages((prev) => [
        ...prev,
        {
          user_id: user.id,
          sender: "bot",
          message: { type: "text", content: "Sorry, something went wrong." },
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
