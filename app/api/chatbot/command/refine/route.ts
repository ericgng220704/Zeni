import { after, NextResponse } from "next/server";
import { openai } from "@/lib/openAi";
import { saveMessage } from "@/lib/actions/messages.actions";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function POST(request: Request) {
  try {
    const { userPrompt, processedResult, action, userId, history } =
      await request.json();

    const processedResultStr =
      typeof processedResult === "object"
        ? JSON.stringify(processedResult, null, 2)
        : processedResult;

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
        example:
          'Show all recurring transactions from my "[BALANCE NAME]" balance.',
      },
      {
        action: "get_transactions",
        example:
          'Get the last 3 expense transactions for my "[BALANCE NAME]" balance.',
      },
      {
        action: "create_transaction",
        example:
          "Add a $[AMOUNT] expense for my balance '[BALANCE NAME]' for groceries on [DATE].",
      },
      {
        action: "update_user_profile",
        example:
          'Change my username to "[NEW USER NAME]" and set my favorite color to #[NEW COLOR].',
      },
    ];

    // Format BOT_ACTIONS into a bullet list.
    const formattedActions = BOT_ACTIONS.map(
      (item) => `- ${item.action}: ${item.example}`
    ).join("\n");

    // Build a prompt to instruct OpenAI on how to refine the result.
    const prompt = `
You are a helpful assistant.
A user provided the following prompt:
"${userPrompt}"

The system processed the command and produced this result:
"${processedResultStr}"

The requested action is: "${action}"

Please review the processed result in the context of the user's prompt and:
• Correct any errors or irrelevant information.
• Remove unnecessary details.
• Return a concise, refined, and friendly answer that directly addresses the user's request.

Important:
1. All entity names (for example, balance names) are case sensitive. Use the exact case as provided by the user.
   For instance, if the user prompt is "help me delete hehe balance please" but the actual balance name is "HEHE", your answer must reflect the user’s input (i.e. "hehe").
2. If the processed result has errors or is missing fields, refer to the available actions below to provide a proper command:
${formattedActions}

Return only the refined answer in readable, plain text.
    `;

    const conversationHistory: ChatCompletionMessageParam[] = Array.isArray(
      history
    )
      ? history.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.message,
        }))
      : [];

    // Call the OpenAI API to get a refined answer.
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant who refines and improves chatbot responses to better match user queries. Consider previous messages when needed.",
        },
        ...conversationHistory,
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const refinedMessage = response.choices[0].message.content;

    after(async () => {
      await saveMessage({
        userId,
        sender: "bot",
        message: refinedMessage || "",
      });
    });

    return NextResponse.json({
      success: true,
      refinedMessage,
    });
  } catch (error) {
    console.error("Error in refine endpoint:", error);
    return NextResponse.json({
      success: false,
      message: "Error refining result",
    });
  }
}
