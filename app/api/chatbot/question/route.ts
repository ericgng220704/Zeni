import { NextResponse } from "next/server";
import { openai } from "@/lib/openAi";

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    // Provide the app context in the system message
    const systemMessage = `
    You are a helpful assistant for the Zeni expense management app. Here is the context about the app:

    The app allows users to manage their finances with several core features:
    - **Balances:** A shared account where users can record incomes and expenses.
    - **Budgets:** Set spending limits for categories to help users manage their money.
    - **Transactions:** Record individual income or expense entries, each linked to a specific balance.
    - **Recurring Transactions:** Schedule regular income or expense entries automatically.
    - **Collaborator Management:** Invite and manage collaborators for shared balances.
    - **Financial Insights:** View interactive charts and reports that visualize expenses by category, spending trends, and more.


    When answering questions:
    - Use clear, concise language.
    - Provide step-by-step instructions when appropriate.
    - Avoid technical jargon unless necessary.
    - Keep your responses within 200 tokens.
    - Focus on practical usage examples and relevant details about the app features.

    Please answer the user's question based on this context.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: input },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const resultText = response.choices[0].message;
    return NextResponse.json({
      success: true,
      resultText,
    });
  } catch (error) {
    console.error("Error in question model:", error);
    return NextResponse.json({
      success: true,
      status: 500,
      message: "Error in answering question",
    });
  }
}
