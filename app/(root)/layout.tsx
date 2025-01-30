import { auth } from "@/auth";
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
    <div className="h-screen flex overflow-hidden">
      <SideNav />
      <div className="flex-grow flex flex-col">
        <TopNav user={session.user} />
        <div className="flex-grow overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
