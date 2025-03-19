import Image from "next/image";
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
const V3 = (
  <div className="prose max-w-none text-gray-700">
    <p className="mb-4">
      Hey, everyone. It’s Eric here—back with another mighty update for Zeni App
      V3!
    </p>
    <p className="mb-4">
      First up, massive shout-out to{" "}
      <span className="font-semibold hover:underline underline-offset-2">
        <a href="https://www.linkedin.com/in/christopher-usick-b38832a4/">
          Christopher Usick
        </a>
      </span>{" "}
      for suggesting our brand-new Forecast feature. This powerful tool
      harnesses AI to crunch your recurring transactions and the latest three
      months of data, giving you your very first financial forecast right in
      your balance view.
    </p>
    <p className="mb-4">
      But that’s not all—the AI goes even deeper. It further analyzes your
      current forecast, active budgets, and historical trends to dish out both a
      concise summary and detailed insights into your financial landscape.
    </p>
    <p className="mb-4">
      And wait, there’s more! Our AI now serves up 2-4 personalized tips to help
      you level up your financial game. It’s like having a mini financial coach
      right in your pocket.
    </p>
    <div className="w-full flex items-center justify-center mb-4">
      <div className="flex items-center justify-center bg-zinc-100 p-2 rounded-2xl overflow-hidden">
        <Image
          src={"/version/analysis.png"}
          alt="analysis demo"
          className="rounded-xl"
          height={500}
          width={450}
        />
      </div>
    </div>
    <p className="mb-4">
      Plus, our innovative and cute chatbot is now live across the app. Not only
      is it smarter than ever, but it also remembers your chat history to keep
      your interactions smooth and on point. Go ahead and give it a try!
    </p>

    <div className="w-full flex items-center justify-center mb-4">
      <div className="flex items-center justify-center bg-zinc-100 p-2 rounded-2xl overflow-hidden">
        <Image
          src={"/version/chatbot_demo.png"}
          alt="analysis demo"
          className="rounded-xl"
          height={500}
          width={450}
        />
      </div>
    </div>

    <h1 className="mb-2 h3">New Features Summary:</h1>
    <ul className="list-disc ml-5">
      <li className="mb-1">
        <strong>Forecast Feature:</strong> AI-powered forecasting using your
        recurring transactions and the latest three months of data.
      </li>

      <li className="mb-1">
        <strong>Advanced AI Analysis:</strong> In-depth insights with both a
        summary and detailed breakdown of your financial trends.
      </li>
      <li className="mb-1">
        <strong>Personalized Tips:</strong> Get 2-4 custom suggestions to boost
        your financial health.
      </li>
      <li className="mb-1">
        <strong>Analysis Rotation:</strong> Every forecast and analysis
        including persontips is new every month!
      </li>
      <li className="mb-1">
        <strong>Universal and smarter Chatbot:</strong> Stay globally available
        throught out the app, become smarter with 4 process layers, and able to
        remember chat history.
      </li>
    </ul>
    <p className="mt-2">
      That’s all for now. Thanks for riding along on Zeni App’s journey—your
      feedback keeps me improving!
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
          defaultValue="version-3"
        >
          <AccordionItem value="version-3">
            <AccordionTrigger className="text-lg">
              Announcing Zeni App Version 3
            </AccordionTrigger>
            <AccordionContent>{V3}</AccordionContent>
          </AccordionItem>
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
