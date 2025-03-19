import { decreaseChatbotLimit } from "@/lib/actions/user.actions";
import { openai } from "@/lib/openAi";
import { format } from "date-fns";
import { NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const BOT_ACTIONS = [
  {
    action: "create_balance",
    example:
      "Create a balance named [BALANCE NAME] with $[INITIAL AMOUNT] initial amount.",
  },
  {
    action: "update_balance",
    example:
      "Update my [BALANCE NAME] balance name to [NEW BALANCE NAME] and set it to $[CURRENT BALANCE].",
  },
  {
    action: "delete_balance",
    example: "Delete my balance named [BALANCE NAME].",
  },
  { action: "get_balances", example: "Show all my balances." },
  {
    action: "get_user_balances",
    example: "Show me the user balances for my [BALANCE NAME] balance.",
  },
  {
    action: "get_balance_by_id",
    example: "Show me the details of my [BALANCE NAME] balance.",
  },
  {
    action: "get_budgets",
    example: "Show me all budgets for my [BALANCE NAME] balance.",
  },
  {
    action: "get_category_totals_by_balance",
    example: "Show category totals for my [BALANCE NAME] balance.",
  },
  {
    action: "create_recurring_transaction",
    example:
      "Create a recurring monthly $[AMOUNT] expense for [CATEGORY] from my [BALANCE NAME] balance starting on [DATE].",
  },
  {
    action: "get_recurring_transactions",
    example: "Show all recurring transactions from my [BALANCE NAME] balance.",
  },
  {
    action: "get_transactions",
    example:
      "Get the last 3 expense transactions for my [BALANCE NAME] balance.",
  },
  {
    action: "create_transaction",
    example:
      "Add a $[AMOUNT] expense for my balance '[BALANCE NAME]' for groceries on [DATE].",
  },
  {
    action: "update_user_profile",
    example:
      "Change my username to [NEW USER NAME] and set my favorite color to #[NEW COLOR].",
  },
];

export async function POST(request: Request) {
  try {
    const { input, userId, history } = await request.json();
    if (!input) {
      return NextResponse.json({
        success: false,
        message: "No command provided!",
        status: 400,
      });
    }

    // Check and decrease the chatbot limit.
    const {
      success: limitSuccess,
      decreasable,
      currentLimit,
    } = await decreaseChatbotLimit(userId);
    if (limitSuccess && !decreasable) {
      return NextResponse.json({
        success: false,
        resultText: "Chat bot limit reached!",
        currentLimit,
      });
    }
    if (!limitSuccess) {
      return NextResponse.json({
        success: false,
        resultText: "An error occurred while checking limit.",
        currentLimit,
      });
    }

    // Format today's date.
    const today = format(new Date(), "yyyy-MM-dd (EEEE)");

    // Format BOT_ACTIONS into a bullet list for clarity.
    const formattedActions = BOT_ACTIONS.map(
      (action) => `- ${action.action}: ${action.example}`
    ).join("\n");

    const prompt = `
Today's date is ${today}.

You are an assistant for the Zeni expense management app.
Your task is to analyze the conversation history along with the latest user command to refine the user's intent into a clear, error-free command.
Based on the context, produce a refined command that accurately reflects the user's intent.
Refer to the following available actions as guidance:
${formattedActions}

For example, consider this conversation:
User: "help me create a new balance"
Assistant: "Please provide a name for the new balance you'd like to create."
User: "I think I will call it Zalo"
The refined command should be:
{
  "command": "Create a balance named Zalo."
}

Important:
1. If the user does not explicitly provide a category field—or
if the intent is unclear—do not autofill the category field.
In such cases, leave the category field as null.

2. If the user's intent does not appropriately or entirely fit one
of the available actions, respond with a JSON object containing a
"command" key that apologizes and suggests other related actions.
For example, output:
{
  "command": "Sorry, the action is not supported."
}


Additional context:
list of categories:
[
  {
    id: "0886fa80-b1a8-46c2-b115-2d2c42fb7678",
    name: "Tax Refunds",
    icon: "FaHandHoldingDollar",
    type: "income",
    color: "#FFEDD5",
    createdAt: new Date("2024-12-18T23:16:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "22d70cf7-ff51-4cbb-af33-32ed28189158",
    name: "Bonuses",
    icon: "FaSackDollar",
    type: "income",
    color: "#FED7E2",
    createdAt: new Date("2024-12-18T23:15:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "3442d458-57ac-41ed-ab7a-23c6761452a4",
    name: "Wages",
    icon: "FaBriefcase",
    type: "income",
    color: "#E9D8FD",
    createdAt: new Date("2024-12-18T23:13:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "f7edb999-e864-473c-b8f1-d624ded962ba",
    name: "Salary",
    icon: "FaBriefcase",
    type: "income",
    color: "#BEE3F8",
    createdAt: new Date("2024-12-18T23:13:00"),
    updatedAt: new Date("2025-01-10T13:32:00"),
  },
  {
    id: "5e12a355-7d4e-4d01-9fb9-62161f87fb91",
    name: "Shopping",
    icon: "FaCartShopping",
    type: "expense",
    color: "#C6F6D5",
    createdAt: new Date("2024-12-18T23:12:00"),
    updatedAt: new Date("2025-01-10T13:33:00"),
  },
  {
    id: "2198248b-f18e-4a4f-8a3c-e8f0586154ea",
    name: "Dining Out",
    icon: "FaChampagneGlasses",
    type: "expense",
    color: "#FEEBC8",
    createdAt: new Date("2024-12-18T23:11:00"),
    updatedAt: new Date("2025-01-10T13:33:00"),
  },
  {
    id: "53242a13-c4fb-4010-ad29-79d38af3397f",
    name: "Entertainment",
    icon: "FaGamepad",
    type: "expense",
    color: "#FCD5CE",
    createdAt: new Date("2024-12-18T23:10:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "8fb2a603-a87f-4406-967a-686ff52bde8b",
    name: "Snacks",
    icon: "FaCookieBite",
    type: "expense",
    color: "#FFFACD",
    createdAt: new Date("2024-12-18T23:12:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "c7232406-1814-49a3-b9fe-fe004363e7ea",
    name: "Groceries",
    icon: "FaBasketShopping",
    type: "expense",
    color: "#FFEDD5",
    createdAt: new Date("2024-12-18T23:11:00"),
    updatedAt: new Date("2025-01-10T13:33:00"),
  },
  {
    id: "c155cfd2-eb71-486b-91ce-6cdb3a33be2c",
    name: "Food",
    icon: "FaUtensils",
    type: "expense",
    color: "#FED7E2",
    createdAt: new Date("2024-12-18T23:10:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "782f5634-76dc-4434-9fc6-08e7ebf6ead4",
    name: "Bills",
    icon: "FaReceipt",
    type: "expense",
    color: "#E9D8FD",
    createdAt: new Date("2024-12-18T23:10:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
  {
    id: "cc9a19ac-efec-459f-8186-9ae681007325",
    name: "Housing",
    icon: "FaHouseCircleCheck",
    type: "expense",
    color: "#BEE3F8",
    createdAt: new Date("2024-12-18T23:09:00"),
    updatedAt: new Date("2025-01-10T13:34:00"),
  },
];

Now, refine the following command based on the conversation context:
"${input}"

Return only a JSON object with a single key "command" containing the refined command.
    `;

    // Build conversation history (if provided) using only the latest 6 messages.
    const conversationHistory: ChatCompletionMessageParam[] = Array.isArray(
      history
    )
      ? history.slice(-6).map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.message,
        }))
      : [];

    // Call the OpenAI API.
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an assistant for the Zeni expense management app.",
        },
        ...conversationHistory,
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0,
    });

    const resultContent = response.choices[0].message.content || "";
    let parsedResult;
    try {
      parsedResult = JSON.parse(resultContent);
    } catch (err) {
      return NextResponse.json({
        success: false,
        message:
          "Unable to parse response from the AI. Please try again with a different command.",
        status: 500,
      });
    }

    return NextResponse.json({
      success: true,
      command: parsedResult.command,
      currentLimit,
    });
  } catch (error) {
    console.error("Error in craft route:", error);
    return NextResponse.json({
      success: false,
      message: "Error processing command",
      status: 500,
    });
  }
}
