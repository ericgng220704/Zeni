import { NextResponse } from "next/server";
import { openai } from "@/lib/openAi";

export async function POST(request: Request) {
  try {
    const { userPrompt, processedResult, action } = await request.json();

    const processedResultStr =
      typeof processedResult === "object"
        ? JSON.stringify(processedResult, null, 2)
        : processedResult;

    console.log(processedResultStr);

    // Build a prompt to instruct OpenAI on how to refine the result.
    const prompt = `
    You are a helpful assistant. A user provided the following prompt:
    "${userPrompt}"

    Our system processed the command and returned the following result:
    "${processedResultStr}"

    The requested action is: "${action}"

    Please review the processed result in the context of the user's prompt.
    - Correct any errors or irrelevant information.
    - Filter out unnecessary details.
    - Provide a concise, refined, and friendly answer that directly addresses the user's request.

    Return only the refined answer in readable formatted plain text.
    `;

    // Call the OpenAI API to get a refined answer.
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an assistant who refines and improves chatbot responses to better match user queries.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const refinedMessage = response.choices[0].message.content;

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
