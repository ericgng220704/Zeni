import { auth } from "@/auth";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/sign-in");
  }

  return <DashboardPage user={session.user} />;
}
