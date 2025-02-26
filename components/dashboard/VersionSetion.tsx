import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const V1 = (
  <div className="prose max-w-none">
    <p>
      I'm thrilled to announce the release of <strong>Zeni V1</strong>, a
      personal project I've been passionately designing and developing over the
      past few weeks. Zeni V1 is now live in production mode (currently in
      beta), and I'm eager to get it into your hands!
    </p>
    <h3 className="text-lg font-semibold mt-4">What is Zeni V1?</h3>
    <p>
      Zeni V1 is an innovative expense management app designed to help you
      track, manage, and understand your finances in a simple and interactive
      way. Whether you're handling personal expenses or collaborating with
      others on shared balances, this app is built to streamline your financial
      management.
    </p>
    <h3 className="text-lg font-semibold mt-4">Key Features Include:</h3>
    <ul className="list-disc ml-5">
      <li>
        💲💲💲Balances:
        <ul className="list-disc ml-5">
          <li>Multi-User Collaboration: Easily manage shared balances.</li>
          <li>
            Email Invitations: Only the balance owner can invite others via
            email.
          </li>
          <li>
            Detailed Visualizations: Get insights with comprehensive charts
            showing expenses and incomes over time and by category.
          </li>
          <li>
            Recurring Transactions: Set up and manage recurring income or
            expense transactions effortlessly.
          </li>
        </ul>
      </li>
      <li className="mt-2">
        🏦💸💸Transactions (Expense/Income):
        <ul className="list-disc ml-5">
          <li>
            Full CRUD Operations: Create, update, delete, and view transactions
            seamlessly.
          </li>
          <li>
            Advanced Views: Group transactions by date and filter them for
            better clarity.
          </li>
        </ul>
      </li>
      <li className="mt-2">
        🎯🎯🎯Budgets:
        <ul className="list-disc ml-5">
          <li>
            Smart Budget Management: Create and monitor budgets with ease.
          </li>
          <li>
            Real-Time Notifications: Receive alerts on the transaction page when
            your spending is near or exceeds your set limits.
          </li>
          <li>
            Interactive Data Visualization: Dedicated budget pages to help you
            understand and control your finances.
          </li>
        </ul>
      </li>
      <li className="mt-2">
        👤👤👤User Profile:
        <ul className="list-disc ml-5">
          <li>
            Personalized Experience: Select your default balance, customize your
            profile color (which reflects in charts and even in the chatbot
            messages), and manage your profile information.
          </li>
        </ul>
      </li>
      <li className="mt-2">
        💬💬💬Chatbot:
        <ul className="list-disc ml-5">
          <li>
            Standout Feature: Zeni's built-in chatbot makes the app not only
            convenient but also smart.
          </li>
          <li>
            Dual Models:
            <ul className="list-disc ml-5">
              <li>
                Question Model: Provides answers to your “how-to” queries and
                guides you through the app.
              </li>
              <li>
                Command Model: Enables you to execute actions directly within
                the app through natural language prompts—making managing your
                finances more intuitive than ever.
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <p className="mt-4">
      I truly appreciate any feedback, suggestions, or bug reports you may have.
      Please feel free to reach out via email at{" "}
      <a
        href="mailto:giahaonguyen2207@gmail.com"
        className="text-blue-500 hover:underline"
      >
        giahaonguyen2207@gmail.com 🥰
      </a>
      .
    </p>
    <p className="mt-4">
      Thank you for taking the time to check out Zeni V1. Your insights will be
      invaluable as I continue to refine and expand its features. Let’s work
      together to make financial management smarter and more efficient!
    </p>
  </div>
);

const V2 = (
  <div className="prose max-w-none">
    <p className="mb-6 text-gray-700">
      I'm thrilled to introduce Zeni App Version 2—an update designed to enhance
      your experience and streamline your financial management. Here’s what’s
      new in this release:
    </p>

    <div className="mb-8">
      <h2 className="text-lg font-semibold mt-4">What’s New:</h2>
      <ul className="list-disc ml-6 text-gray-700 space-y-2">
        <li>
          <strong>Dashboard Implementation:</strong> Get an at-a-glance overview
          of your balances with our brand-new, intuitive dashboard.
        </li>
        <li>
          <strong>Enhanced Chatbot:</strong> Enjoy a more user-friendly chatbot
          experience, now providing clearer and more helpful final answers.
        </li>
        <li>
          <strong>User Activity Tracking:</strong> Monitor your app interactions
          with our new tracking system, keeping you informed about your
          financial journey.
        </li>
        <li>
          <strong>Bug Fixes:</strong>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Recurring transaction failures</li>
            <li>User profile mass update glitches</li>
            <li>Chatbot errors in specific cases</li>
          </ul>
        </li>
      </ul>
    </div>

    <div>
      <h2 className="text-lg font-semibold mt-4">Looking Ahead:</h2>
      <ul className="list-disc ml-6 text-gray-700 space-y-2">
        <li>
          <strong>New Login System:</strong> Soon, you’ll be able to sign in
          using credentials, moving beyond the current Google-only login option.
        </li>
        <li>
          <strong>Monthly Report Feature:</strong> Gain deeper insights into
          your financial activities with detailed monthly reports.
        </li>
        <li>
          <strong>UI Animations:</strong> Enjoy a more dynamic and engaging user
          interface with upcoming animation enhancements.
        </li>
        <li>
          <strong>Revamped Invitation Email:</strong> Look forward to a more
          attractive and professional invitation email design.
        </li>
        <li>
          <strong>Additional Bug Fixes:</strong> Continuous improvements to
          ensure a smoother, more reliable experience.
        </li>
      </ul>
    </div>

    <p className="mt-8 text-gray-700">
      Thank you for your continued support as I work to make Zeni even better.
      I'm excited for you to experience these new updates and look forward to
      bringing more innovations in the near future!
    </p>
  </div>
);

export default function VersionList() {
  return (
    <Card className="md:!px-7 md:!py-4  lg:!px-20 lg:!py-5">
      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="version-2"
        >
          <AccordionItem value="version-2">
            <AccordionTrigger className="text-lg">
              Announcing Zeni App Version 2
            </AccordionTrigger>
            <AccordionContent>{V2}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="version-1">
            <AccordionTrigger className="text-lg">
              Zeni V1 – My Personal Expense Management Project Kickoff! 🙌
            </AccordionTrigger>
            <AccordionContent>{V1}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
