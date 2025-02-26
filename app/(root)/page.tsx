import { auth } from "@/auth";
import ChatWindow from "@/components/chatbot/ChatWindow";
import DashboardPage from "@/components/dashboard/DashboardPage";
import VersionList from "@/components/dashboard/VersionSetion";
import OnboardingDialog from "@/components/OnboardingDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) return;

  return (
    <main className="main-container px-2 md:px-5 lg:px-10 mb-12">
      <h1 className="h1">Dashboard</h1>
      <Tabs defaultValue="overview" className="w-full my-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot🔥</TabsTrigger>
          <TabsTrigger value="analytic">Version</TabsTrigger>
        </TabsList>
        <TabsContent value="analytic">
          <VersionList />
        </TabsContent>
        <TabsContent value="chatbot">
          <ChatWindow user={session.user} />
        </TabsContent>
        <TabsContent value="overview">
          <DashboardPage user={session.user} />
        </TabsContent>
      </Tabs>

      <OnboardingDialog user={session.user} />
    </main>
  );
}
