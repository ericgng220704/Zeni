import { auth } from "@/auth";
import { ChatbotProvider } from "@/components/chatbot/ChatBotContext";
import ChatBotUniversalWindow from "@/components/ChatBotUniversalWindow";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return redirect("/sign-in");
  }

  return (
    <ChatbotProvider user={session.user}>
      <div className="h-dvh flex overflow-hidden relative">
        <SideNav />
        <div className="flex-grow flex flex-col">
          <TopNav user={session.user} />
          <div className="flex-grow flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto pb-2 pr-2 bg-stone-50">
              <div className="h-full bg-white rounded-3xl overflow-y-scroll">
                {children}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-2 right-6 z-50">
          <ChatBotUniversalWindow user={session.user} />
        </div>
      </div>
    </ChatbotProvider>
  );
}
