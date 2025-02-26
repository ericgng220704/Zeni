import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const SAMPLE_QUESTIONS = [
  {
    question: "What is a balance in Zeni?",
    summary:
      "Learn how balances are used to group transactions and track specific funds.",
  },
  {
    question: "How do I create a budget?",
    summary:
      "Discover how to define spending limits and track them over a specific time frame.",
  },
  {
    question: "What can I use Zeni for?",
    summary:
      "Explore the various features like budgeting, tracking expenses, and setting financial goals.",
  },
  {
    question: "How do recurring transactions work?",
    summary:
      "Understand how to schedule repeating expenses or income automatically.",
  },
];

const BOT_ACTIONS = [
  {
    action: "create_balance",
    summary: "Create a new balance with an optional initial amount.",
    example: '“Create a balance named "Groceries" with $50 initial amount.”',
  },
  {
    action: "update_balance",
    summary: "Update the name or current balance of an existing balance.",
    example:
      '“Update my "Groceries" balance name to "Food" and set it to $100.”',
  },
  {
    action: "delete_balance",
    summary: "Remove a balance completely from your account.",
    example: '“Delete my balance named "TravelFund".”',
  },
  {
    action: "get_balances",
    summary: "Retrieve a list of all balances you have.",
    example: "“Show all my balances.”",
  },
  {
    action: "get_user_balances",
    summary:
      "Retrieve user-specific balances, given a particular balance identifier.",
    example: '“Show me the user balances for my "Groceries" balance.”',
  },
  {
    action: "get_balance_by_id",
    summary: "Get the details of a specific balance by ID or name.",
    example: '“Show me the details of my "Groceries" balance.”',
  },
  {
    action: "get_budgets",
    summary:
      "Retrieve budgets associated with a specific balance, optionally filtered by type.",
    example: '“Show me all budgets for my "Food" balance.”',
  },
  {
    action: "create_budget",
    summary:
      "Create a budget with a type, balance, category, amount, and date range.",
    example:
      "“Create a monthly budget of $200 for groceries starting next week.”",
  },
  {
    action: "get_category_totals_by_balance",
    summary: "Retrieve category totals for a specific balance.",
    example: '“Show category totals for my "Food" balance.”',
  },
  {
    action: "create_recurring_transaction",
    summary:
      "Create a recurring transaction with an amount, description, date, category, and recurrence interval.",
    example:
      '“Create a recurring monthly $100 expense for rent from my "Home" balance.”',
  },
  {
    action: "get_recurring_transactions",
    summary: "Retrieve all recurring transactions for a specific balance.",
    example: '“Show all recurring transactions from my "Home" balance.”',
  },
  {
    action: "get_transactions",
    summary:
      "Retrieve transactions (income or expense) for a specific balance, with optional limit or offset.",
    example: '“Get the last 10 expense transactions for my "Food" balance.”',
  },
  {
    action: "create_transaction",
    summary:
      "Create a single transaction with an amount, description, date, category, and type.",
    example:
      "“Add a $75 expense for my balance 'sometin' for groceries on Monday.”",
  },
  {
    action: "update_user_profile",
    summary:
      "Update user profile fields such as name, color (in hex), or default balance.",
    example:
      '“Change my username to "JohnDoe" and set my favorite color to #ffcc00.”',
  },
];

export default function InstructionCard({ type }: { type: string }) {
  console.log(BOT_ACTIONS.length);
  return (
    <div>
      {type === "command" && (
        <>
          <h4 className="text-sm font-semibold">ZeniBot Actions</h4>
          <p className="text-xs text-muted-foreground">
            Here are all actions the bot can perform.
          </p>

          <Separator className="my-3" />

          {/* Use ScrollArea if the list can be long */}
          <ScrollArea className="h-64 pr-2">
            {BOT_ACTIONS.map(({ action, summary, example }) => (
              <div key={action} className="mb-4">
                <div className="font-medium text-gray-800">{action}</div>
                <p className="text-xs text-muted-foreground">{summary}</p>
                <p className="text-xs italic mt-1 text-muted-foreground">
                  Example: <span className="font-normal">{example}</span>
                </p>
              </div>
            ))}
          </ScrollArea>
        </>
      )}
      {type === "question" && (
        <>
          <h4 className="text-sm font-semibold">Common Questions</h4>
          <p className="text-xs text-muted-foreground">
            Here are some examples of questions you can ask ZeniBot.
          </p>

          <Separator className="my-3" />

          <ScrollArea className="h-64 pr-2">
            {SAMPLE_QUESTIONS.map(({ question, summary }) => (
              <div key={question} className="mb-4">
                <div className="font-medium text-gray-800">"{question}"</div>
                <p className="text-xs text-muted-foreground">{summary}</p>
              </div>
            ))}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
