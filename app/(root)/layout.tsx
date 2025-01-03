import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { getBalances } from "@/lib/actions/balance.actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) return redirect("/sign-in");
  return (
    <div className="min-h-screen flex">
      <SideNav />
      <div className="flex-grow">
        <TopNav name={user.fullName} email={user.email} />
        <div>{children}</div>
      </div>
    </div>
  );
}
