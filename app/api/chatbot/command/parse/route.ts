import { decreaseChatbotLimit } from "@/lib/actions/user.actions";
import { openai } from "@/lib/openAi";
import { format } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { input, userId } = await request.json();
    if (!input) {
      return NextResponse.json({
        success: false,
        message: "No command provided!",
        status: 500,
      });
    }

    const { success, decreasable, currentLimit } = await decreaseChatbotLimit(
      userId
    );
    if (success && !decreasable) {
      return NextResponse.json({
        success: false,
        resultText: "Chat bot limit reached!",
      });
    }

    if (!success) {
      return NextResponse.json({
        success: false,
        resultText: "Error occured",
      });
    }

    const today = format(new Date(), "yyyy-MM-dd (EEEE)");

    // Build a detailed prompt that enforces a strict JSON output following the app's schema.
    const prompt = `
Today's date is ${today}

You are a financial assistant for the Zeni expense management app.
When a user provides a command in natural language, parse it and output a strictly formatted JSON object that will be used to execute an action.
The JSON object must follow this exact structure (do not include any extra keys or markdown formatting):

{
  "action": "<action>",
  "details": {
    // Additional information required for the action
  },
  "raw_input": "<the original command input>",
  "additions": {
    // Here are the optional / non-required  attributes that user give (try to analyze user input to fill in here, you are smart!)
    // These attributes must follow the schema of the related table.
    // For example, in transaction table, we have attributes: user_id, category_id, balance_id, amount, type, note and date.
    // if some attributes that are not in details but given by user, put it here.
  }
}

The available actions and their required details are:

1. "create_balance":
   - Required details:
     - "name": string
     - "initial_amount": string (a decimal number, output as a string) // can also be refered as "current balance", "initial balance", "balance", "amount"

2. "update_balance":
   - Required details:
     - "balance_id": string (UUID)
     - "name": string (optional; set to null if not provided)
     - "current_balance": string (optional; a decimal number, output as a string; set to null if not provided) // can also be refered as "amout", "initial_amount", "initial balance", "balance"

3. "delete_balance":
   - Required details:
     - "balance_id": string (UUID)

4. "get_balances":
   - Required details: {} (an empty object)

5. "get_user_balances":
   - Required details:
     - "balance_id": string (UUID)

6. "get_balance_by_id":
   - Required details:
     - "balance_id": string (UUID)

7. "get_budgets":
   - Required details:
     - "balance_id": string (UUID)
     - "type": string (optional; one of "MONTHLY", "CATEGORY", "CUSTOM"; set to null if not provided)

8. "create_budget":
   - Required details:
     - "type": string (must be one of "MONTHLY", "CATEGORY", "CUSTOM")
     - "balance_id": string (UUID)
     - "category_id": string (optional; set to null if not provided)
     - "name": string (optional; set to null if not provided)
     - "amount": string (a decimal number, output as a string)
     - "start_date": string in "YYYY-MM-DD" format
     - "end_date": string in "YYYY-MM-DD" format (optional; set to null if not provided)
     - "month": string (optional; a number as a string, set to null if not provided)

9. "update_budget":
   - Required details:
     - "budget_id": string (UUID)
     - "amount": string (optional; a decimal number, output as a string; set to null if not provided)
     - "start_date": string in "YYYY-MM-DD" format (optional; set to null if not provided)
     - "end_date": string in "YYYY-MM-DD" format (optional; set to null if not provided)
     - "name": string (optional; set to null if not provided)
     - "category_id": string (optional; set to null if not provided)
     - "month": string (optional; set to null if not provided)

10. "delete_budget":
    - Required details:
      - "budget_id": string (UUID)

11. "get_budget_by_id":
    - Required details:
      - "budget_id": string (UUID)

12. "set_budget_status":
    - Required details:
      - "budget_id": string (UUID)
      - "new_status": string (must be one of "ACTIVE", "EXPIRED", "CANCELED")

13. "get_category_totals_by_balance":
    - Required details:
      - "balance_id": string (UUID)

14. "create_recurring_transaction":
    - Required details:
      - "amount": string (a decimal number, output as a string)
      - "description": string
      - "date": string in "YYYY-MM-DD" format
      - "balance_id": string (UUID)
      - "category_id": string (UUID)
      - "type": string (must be either "INCOME" or "EXPENSE")
      - "recurrence_interval": string (the recurrence interval in days, output as a string)
      - "user_id": string (UUID)

15. "get_recurring_transactions":
    - Required details:
      - "balance_id": string (UUID)

16. "update_recurring_transaction_status":
    - Required details:
      - "recurring_transaction_id": string (UUID)
      - "status": string (must be either "ACTIVE" or "CANCELED")

17. "get_transactions":
    - Required details:
      - "balance_id": string (UUID)
      - "type": string (must be one of "INCOME", "EXPENSE", or "ALL")
      - "limit": string (optional; a number as a string, set to null if not provided)
      - "offset": string (optional; a number as a string, set to null if not provided)

18. "get_expenses_by_date":
    - Required details:
      - "balance_id": string (UUID)
      - "start_date": string in "YYYY-MM-DD" format
      - "end_date": string in "YYYY-MM-DD" format (optional; set to null if not provided)
      - "category_id": string (optional; set to null if not provided)

19. "create_transaction":
    - Required details:
      - "amount": string (a decimal number as a string)
      - "description": string
      - "date": string in "YYYY-MM-DD" format
      - "balance_id": string (UUID)
      - "category_id": string (UUID)
      - "type": string (must be either "INCOME" or "EXPENSE")

20. "delete_transaction":
    - Required details:
      - "transaction_id": string (UUID)

21. "update_transaction":
    - Required details:
      - "transaction_id": string (UUID)
      - "new_amount": string (a decimal number as a string)
      - "new_description": string
      - "new_date": string in "YYYY-MM-DD" format
      - "new_category_id": string (UUID)

22. "update_user_profile":
    - Required details:
      - "name": string (optional)
      - "color": string (optional)
      - "default_balance_id": string (optional; set to null if not provided)

Important:
- The output JSON must have exactly two keys: "action" and "details". Do not wrap the output in markdown or code block formatting.
- For all numeric values, output the number as a string.
- For any required field missing in the user command, assign its value as null.
- Follow the schema strictly and do not include any extra keys or comments.
- Should analyze carefully date type input, example: "next Monday" => try to find what is the date of next Monday to fill in required attributes.

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

For example, if the user says: "Add a $50 expense for groceries on Monday", the correct output would be:
{
  "action": "create_transaction",
  "details": {
    "amount": "50",
    "description": "groceries",
    "date": "2025-02-04",
    "balance_id": null,
    "category_id": null,
    "type": "EXPENSE"
  },
  "raw_input": "Add a $50 expense for groceries on Monday",
  "additions": null
}

example, if user says: "Delete a budget name "Tet den roi"", the correct output would be:
{
  "action": "delete_budget",
  "details": {
    "budget_id": null,
  },
  "raw_inputs": "Delete a budget name 'Tet den roi'",
  "additions": {
    "name": "Tet den roi",
  }
}

example, if user says: "Delete the dining out expense on 27 February", the correct output would be:
{
  "action": "delete_transaction",
  "details": {
    "transaction_id": null,
  },
  "raw_inputs": "Delete the dining out expense on 27 February",
  "additions": {
    "type": "EXPENSE",
    "date": "2025-2-27",
    "category": "Dining Out",
    "category_id": "6763abd40002ec91dc2c"
  }
}

example, if user says: "Get dining out expenses for the balance named 'Savings' from 2025-06-01 to 2025-06-30", the correct output would be:
{
  "action": "get_expenses_by_date",
  "details": {
    "balance_id": null,
    "start_date": "2025-06-01",
    "end_date": "2025-06-30",
    "category_id": "6763abd40002ec91dc2c"
  },
  "raw_input": "Get dining out expenses for the balance named 'Savings' from 2025-06-01 to 2025-06-30",
  "additions": {
    "name": "Savings"
  }
}

example, if user says: "create a new recurring transaction for my balance Eric which occur every 10 days", the correct output would be:
{
  "action": "create_recurring_transaction",
  "details": {
    "amount": null,
    "description": null,
    "date": null,
    "balance_id": null,
    "category_id": null,
    "type": null,
    "recurrence_interval": "10",
    "user_id": null
  },
  "raw_input": "create a new recurring transaction for my balance Eric which occur every 10 days",
  "additions": {
    "balance_name": "Eric",
  }
}

example, if user says: "Create a monthly budget for my balance named 'Savings' with an amount of $500 starting on 2025-03-01 for 3 months.", the correct output would be:
{
  "action": "create_budget",
  "details": {
    "type": "MONTHLY",
    "balance_id": null,
    "category_id": null,
    "name": null,
    "amount": "500",
    "start_date": "2025-03-01",
    "end_date": null,
    "month": "3"
  },
  "raw_input": "Create a monthly budget for my balance named 'Savings' with an amount of $500 starting on 2025-03-01 for 3 months.",
  "additions": {
    "balance_name": "Savings"
  }
}

example, if user says: "Set up a budget for groceries with an amount of $300 for balance thu.", the correct output would be:
{
  "action": "create_budget",
  "details": {
    "type": "CATEGORY",
    "balance_id": null,
    "category_id": c7232406-1814-49a3-b9fe-fe004363e7ea, // id of category groceries
    "name": null,
    "amount": "300",
    "start_date": "", // Start day should be today in the correct format
    "end_date": null,
    "month": null,
  },
  "raw_input": "Set up a budget for groceries with an amount of $300 for balance thu.",
  "additions": {
    "balance_name": "thu"
  }
}

example, if user says: "Create a budget named 'Holiday Travel' for my balance 'Travel Fund' with $1000, starting on 2025-05-01 and ending on 2025-06-30", the correct output would be:
{
  "action": "create_budget",
  "details": {
    "type": "CUSTOM",
    "balance_id": null,
    "category_id": null,
    "name": "Holiday Travel",
    "amount": "1000",
    "start_date": "2025-05-01",
    "end_date": "2025-06-30",
    "month": null
  },
  "raw_input": "Create a custom budget named 'Holiday Travel' for my balance 'Travel Fund' with $1000, starting on 2025-05-01 and ending on 2025-06-30",
  "additions": {
    "balance_name": "Travel Fund"
  }
}

Now, process the following command:
"${input}"
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strict financial assistant for the Zeni expense management app. Follow the provided schema exactly.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 250,
      temperature: 0,
    });

    const resultJson = response.choices[0].message;
    return NextResponse.json({
      success: true,
      message: "",
      resultJson: resultJson.content,
      currentLimit,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error parsing command",
      status: 500,
    });
  }
}

// note
// try to get rid of ID requirement but name instead (balanceId, categoryId, ) ✅
// strictly handle errors / requiremnets ✅
// careful with date
// add rate limit for account  => subscription feature later on
// category id for recurring transactions
// user privacy!!!, extremely cautious when actions are get, only get what belong to user or what user allowed to get. NO GETTING OTHER USER DATA.
// delete transaction limit only 1
