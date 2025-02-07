import { auth } from "@/auth";
import ChatWindow from "@/components/chatbot/ChatWindow";
import OnboardingDialog from "@/components/OnboardingDialog";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) return;

  return (
    <main className="main-container px-2 md:px-5 lg:px-10 mb-12 ">
      <h1 className="h1">Dashboard</h1>
      <Tabs defaultValue="analytic" className="w-full my-4">
        <TabsList>
          <TabsTrigger value="analytic">Hello 🙌</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>
        <TabsContent value="analytic">
          <Card className="!px-20 !py-5">
            <CardHeader>
              <CardTitle className="text-xl">
                Zeni V1 – My Personal Expense Management Project! 🙌🙌🙌
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>
                  I'm thrilled to announce the release of{" "}
                  <strong>Zeni V1</strong>, a personal project I've been
                  passionately designing and developing over the past few weeks.
                  Zeni V1 is now live in production mode (currently in beta),
                  and I'm eager to get it into your hands!
                </p>
                <h3 className="text-lg font-semibold mt-4">What is Zeni V1?</h3>
                <p>
                  Zeni V1 is an innovative expense management app designed to
                  help you track, manage, and understand your finances in a
                  simple and interactive way. Whether you're handling personal
                  expenses or collaborating with others on shared balances, this
                  app is built to streamline your financial management.
                </p>
                <h3 className="text-lg font-semibold mt-4">
                  Key Features Include:
                </h3>
                <ul className="list-disc ml-5">
                  <li>
                    💲💲💲Balances:
                    <ul className="list-disc ml-5">
                      <li>
                        Multi-User Collaboration: Easily manage shared balances.
                      </li>
                      <li>
                        Email Invitations: Only the balance owner can invite
                        others via email.
                      </li>
                      <li>
                        Detailed Visualizations: Get insights with comprehensive
                        charts showing expenses and incomes over time and by
                        category.
                      </li>
                      <li>
                        Recurring Transactions: Set up and manage recurring
                        income or expense transactions effortlessly.
                      </li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    🏦💸💸Transactions (Expense/Income):
                    <ul className="list-disc ml-5">
                      <li>
                        Full CRUD Operations: Create, update, delete, and view
                        transactions seamlessly.
                      </li>
                      <li>
                        Advanced Views: Group transactions by date and filter
                        them for better clarity.
                      </li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    🎯🎯🎯Budgets:
                    <ul className="list-disc ml-5">
                      <li>
                        Smart Budget Management: Create and monitor budgets with
                        ease.
                      </li>
                      <li>
                        Real-Time Notifications: Receive alerts on the
                        transaction page when your spending is near or exceeds
                        your set limits.
                      </li>
                      <li>
                        Interactive Data Visualization: Dedicated budget pages
                        to help you understand and control your finances.
                      </li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    👤👤👤User Profile:
                    <ul className="list-disc ml-5">
                      <li>
                        Personalized Experience: Select your default balance,
                        customize your profile color (which reflects in charts
                        and even in the chatbot messages), and manage your
                        profile information.
                      </li>
                    </ul>
                  </li>
                  <li className="mt-2">
                    💬💬💬Chatbot:
                    <ul className="list-disc ml-5">
                      <li>
                        Standout Feature: Zeni's built-in chatbot makes the app
                        not only convenient but also smart.
                      </li>
                      <li>
                        Dual Models:
                        <ul className="list-disc ml-5">
                          <li>
                            Question Model: Provides answers to your “how-to”
                            queries and guides you through the app.
                          </li>
                          <li>
                            Command Model:Enables you to execute actions
                            directly within the app through natural language
                            prompts—making managing your finances more intuitive
                            than ever.
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
                <p className="mt-4">
                  I truly appreciate any feedback, suggestions, or bug reports
                  you may have. Please feel free to reach out via email at{" "}
                  <a
                    href="mailto:giahaonguyen2207@gmail.com"
                    className="text-blue-500 hover:underline"
                  >
                    giahaonguyen2207@gmail.com 🥰
                  </a>
                  .
                </p>
                <p className="mt-4">
                  Thank you for taking the time to check out Zeni V1. Your
                  insights will be invaluable as I continue to refine and expand
                  its features. Let’s work together to make financial management
                  smarter and more efficient!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chatbot">
          <ChatWindow user={session.user} />
        </TabsContent>
      </Tabs>

      <OnboardingDialog user={session.user} />
    </main>
  );
}
