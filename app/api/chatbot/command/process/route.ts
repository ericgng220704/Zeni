import {
  createBalance,
  deleteBalance,
  getBalanceById,
  getBalances,
  getUserBalanceByName,
  getUserBalances,
  updateBalance,
} from "@/lib/actions/balance.actions";
import { createBudget, getBudgets } from "@/lib/actions/budget.actions";
import { getCategoryTotalsByBalance } from "@/lib/actions/categoryTotal.actions";
import {
  createRecurringTransaction,
  getRecurringTransactions,
} from "@/lib/actions/recurringTransaction.actions";
import {
  createTransaction,
  getTransactions,
} from "@/lib/actions/transaction.actions";
import {
  updateUserProfile,
  updateUserProfileChatbot,
} from "@/lib/actions/user.actions";
import { parse } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { json } = await request.json();

    if (!json) {
      return NextResponse.json({
        success: false,
        message: "No data to process",
        status: 500,
      });
    }

    const { action, details, raw_input, additions } = json;
    let result;
    switch (action) {
      case "create_balance": {
        if (!details.name) {
          result = {
            success: false,
            message: "Please provide a name to create a balance.",
          };
          break;
        }
        const currentBalance = details.initial_amount
          ? details.initial_amount
          : "0";

        const { success, balance } = await createBalance({
          name: details.name,
          currentBalance: parseFloat(currentBalance),
        });

        if (!success) {
          result = {
            success: false,
            message: "Error creating balance",
          };
          break;
        }

        result = {
          success: true,
          message: `Balance named "${balance.name}" was created successfully with initial amount: ${balance.current_balance}!`,
          data: balance,
        };
        break;
      }

      case "update_balance": {
        // Required: balance_id OR a provided balance name in additions.
        if (!details.balance_id && (!additions || !additions.name)) {
          result = {
            success: false,
            message: "Please provide the balance name to update the balance.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.name
          );
          if (!success) {
            result = {
              success: false,
              message,
            };
            break;
          }
          balanceId = balance.id;
        }

        if (!details.name || !details.current_balance) {
          result = {
            success: false,
            message: `No possible updates to balance named "${additions.name}" are found in your command. Please provide what you want to change (name or current balance). /n `,
          };
          break;
        }

        const updatedData = {
          balanceId: balanceId,
          name: details.name || null,
          currentBalance: details.current_balance || null,
        };
        const { success, updatedBalance } = await updateBalance(updatedData);
        if (!success) {
          result = {
            success: false,
            message: `Error updating balance ${additions.name}`,
          };
          break;
        }
        result = {
          success: true,
          message: `${updatedBalance.name} was updated successfully!`,
          data: updatedBalance,
        };
        break;
      }

      case "delete_balance": {
        // Required: balance_id OR a provided balance name in additions.
        if (!details.balance_id && (!additions || !additions.name)) {
          result = {
            success: false,
            message: "Please provide the balance name to delete the balance.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.name
          );
          if (!success) {
            result = {
              success: false,
              message,
            };
            break;
          }
          balanceId = balance.id;
        }
        const deleteResponse = await deleteBalance(balanceId);
        if (!deleteResponse.success) {
          result = {
            success: false,
            message: `Error deleting balance ${balanceId}`,
          };
          break;
        }
        result = {
          success: true,
          message: deleteResponse.message,
          data: deleteResponse.deletedBalance,
        };
        break;
      }

      case "get_balances": {
        const balancesList = await getBalances();
        result = { success: true, data: balancesList };
        break;
      }

      case "get_user_balances": {
        // Required: balance_id OR a provided balance name in additions.
        if (!details.balance_id && (!additions || !additions.name)) {
          result = {
            success: false,
            message: "Please provide the balance name to get user balances.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.name
          );
          if (!success) {
            result = {
              success: false,
              message: message,
            };
            break;
          }
          balanceId = balance.id;
        }
        const userBalances = await getUserBalances(balanceId);
        result = { success: true, data: userBalances };
        break;
      }

      case "get_balance_by_id": {
        // Required: balance_id OR a provided balance name in additions.
        if (!details.balance_id && (!additions || !additions.name)) {
          result = {
            success: false,
            message: "Please provide the balance name to get balance details.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.name
          );
          if (!success) {
            result = {
              success: false,
              message: message,
            };
            break;
          }
          balanceId = balance.id;
        }
        const balanceDetails = await getBalanceById(balanceId);
        result = { success: true, data: balanceDetails };
        break;
      }

      case "get_budgets": {
        // details: { balance_id, type }
        if (!details.balance_id && (!additions || !additions.name)) {
          result = {
            success: false,
            message: "Please provide the balance name or ID to get budgets.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        // Call the placeholder getBudgets function.
        const { success, budgets } = await getBudgets({
          balanceId,
          type: details.type || null,
        });
        result = { success, data: budgets };
        break;
      }

      case "create_budget": {
        // details: { type, balance_id, category_id, name, amount, start_date, end_date, month }
        const missingFields = [];

        if (!details.type) missingFields.push("type");
        if (!details.balance_id && (!additions || !additions.balance_name))
          missingFields.push("balance_id or balance name");
        if (!details.amount) missingFields.push("amount");
        if (!details.start_date) missingFields.push("start_date");

        if (missingFields.length > 0) {
          result = {
            success: false,
            message: `Missing required fields for budget creation: ${missingFields.join(
              ", "
            )}.`,
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.balance_name
          );

          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        console.log(balanceId);
        const { success, message, budget } = await createBudget({
          type: details.type,
          balanceId,
          categoryId: details.category_id || null,
          name: details.name || null,
          amount: parseFloat(details.amount),
          startDate: new Date(details.start_date),
          endDate: details.end_date ? new Date(details.end_date) : undefined,
          month: parseFloat(details.month) || undefined,
        });
        if (!success) {
          result = {
            success: false,
            message: message || "Error creating budget.",
          };
          break;
        }
        result = {
          success: true,
          message: `Budget created successfully.`,
          data: budget,
        };
        break;
      }

      case "get_category_totals_by_balance": {
        if (!details.balance_id && (!additions || !additions.name)) {
          result = {
            success: false,
            message:
              "Please provide the balance identifier (ID or name) to get category totals.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        const categoryTotals = await getCategoryTotalsByBalance(balanceId);
        result = { success: true, data: categoryTotals };
        break;
      }

      case "create_recurring_transaction": {
        const missingFields: string[] = [];

        if (!details.amount) missingFields.push("amount");
        if (!details.description) missingFields.push("description");
        if (!details.date) missingFields.push("date");
        if (!details.balance_id && (!additions || !additions.balance_name))
          missingFields.push("balance_id or balance_name");
        if (!details.category_id) missingFields.push("category_id");
        if (!details.type) missingFields.push("type");
        if (!details.recurrence_interval)
          missingFields.push("recurrence_interval");
        if (!details.user_id) missingFields.push("user_id");

        if (missingFields.length > 0) {
          result = {
            success: false,
            message: `Missing required fields for creating recurring transaction: ${missingFields.join(
              ", "
            )}.`,
          };
          break;
        }

        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.balance_name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        const createRecurringResponse = await createRecurringTransaction({
          amount: parseFloat(details.amount),
          description: details.description,
          date: new Date(details.date),
          balanceId,
          categoryId: details.category_id,
          type: details.type,
          recurrenceInterval: details.recurrence_interval,
          userId: details.user_id,
        });
        if (!createRecurringResponse.success) {
          result = {
            success: false,
            message:
              createRecurringResponse.message ||
              "Error creating recurring transaction.",
          };
          break;
        }
        result = {
          success: true,
          message: "Recurring transaction created successfully.",
          data: createRecurringResponse.recurringTransaction,
        };
        break;
      }

      case "get_recurring_transactions": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = {
            success: false,
            message:
              "Please provide the balance identifier (ID or name) to get recurring transactions.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.balance_name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        const { success, message, transactions } =
          await getRecurringTransactions(balanceId);
        if (!success) {
          result = {
            success: false,
            message: message || "Error retrieving recurring transactions.",
          };
          break;
        }
        result = {
          success: true,
          data: transactions,
        };
        break;
      }

      case "get_transactions": {
        if (
          (!details.balance_id && (!additions || !additions.balance_name)) ||
          !details.type
        ) {
          result = {
            success: false,
            message:
              "Please provide the balance identifier (ID or name) and transaction type for getting transactions.",
          };
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.balance_name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        const transactionsResponse = await getTransactions({
          balanceId,
          type: details.type,
          limit: details.limit || null,
          offset: details.offset || null,
        });
        if (!transactionsResponse.success) {
          result = {
            success: false,
            message:
              transactionsResponse.message || "Error retrieving transactions.",
          };
          break;
        }
        result = { success: true, data: transactionsResponse.transactions };
        break;
      }

      case "create_transaction": {
        const missingFields: string[] = [];

        if (!details.amount) missingFields.push("amount");
        if (!details.description) missingFields.push("description");
        if (!details.date) missingFields.push("date");
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          missingFields.push("balance_id or balance_name");
        }
        if (!details.category_id) missingFields.push("category_id");
        if (!details.type) missingFields.push("type");

        if (missingFields.length > 0) {
          result = {
            success: false,
            message: `Missing required fields for creating transaction: ${missingFields.join(
              ", "
            )}.`,
          };
          break;
        }

        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.balance_name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }
        const createTransactionResponse = await createTransaction({
          amount: parseFloat(details.amount),
          description: details.description,
          date: new Date(details.date),
          balanceId,
          categoryId: details.category_id,
          type: details.type,
        });
        if (!createTransactionResponse.success) {
          result = {
            success: false,
            message:
              createTransactionResponse.message ||
              "Error creating transaction.",
          };
          break;
        }
        result = {
          success: true,
          message: "Transaction created successfully.",
          data: createTransactionResponse.transaction,
        };
        break;
      }

      case "update_user_profile": {
        // First, check if there's anything to update.
        if (
          !details.name &&
          !details.color &&
          !details.default_balance_id &&
          (!additions || !additions.default_balance_name)
        ) {
          result = {
            success: false,
            message: "There is nothing to update",
          };
          break;
        }

        // Validate the hex color if provided.
        if (details.color) {
          const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
          if (!hexColorRegex.test(details.color)) {
            result = {
              success: false,
              message:
                "The 'color' field must be in hex format (e.g., #ffffff). Please provide a valid hex color code.",
            };
            break;
          }
        }

        // Resolve the default balance ID.
        // Note: We use details.default_balance_id, but if not provided, try to resolve via additions.default_balance_name.
        let balanceId = details.default_balance_id || null;
        if (!balanceId && additions && additions.default_balance_name) {
          const { success, message, balance } = await getUserBalanceByName(
            additions.default_balance_name
          );
          if (!success) {
            result = { success: false, message };
            break;
          }
          balanceId = balance.id;
        }

        // Build the updates object conditionally.
        const updates: {
          name?: string;
          color?: string;
          defaultBalanceId?: string | undefined;
        } = {};

        if (details.name) {
          updates.name = details.name;
        }

        if (details.color) {
          updates.color = details.color;
        }

        if (balanceId !== null) {
          updates.defaultBalanceId = balanceId;
        }

        // Now, call the updateUserProfile function with the conditional updates.
        const updateResponse = await updateUserProfileChatbot(updates);

        if (!updateResponse.success) {
          result = {
            success: false,
            message: updateResponse.message || "Error updating user profile.",
          };
          break;
        }

        result = {
          success: true,
          message: "User profile updated successfully.",
          data: updateResponse.user,
        };
        break;
      }

      default: {
        result = {
          success: false,
          message: `Action "${action}" is not supported`,
        };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Error processing command",
      status: 500,
    });
  }
}
