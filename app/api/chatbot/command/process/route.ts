import { db } from "@/database/drizzle";
import { balances } from "@/database/schema";
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
import { getBudgetsWithNotifications } from "@/lib/actions/budgetNotification.actions";
import { getCategories } from "@/lib/actions/category.actions";
import { getCategoryTotalsByBalanceChatbot } from "@/lib/actions/categoryTotal.actions";
import {
  calculateForecast,
  enableForecast,
} from "@/lib/actions/forecast.actions";
import { loadAnalysisTab } from "@/lib/actions/initalLoad.actions";
import { saveMessage } from "@/lib/actions/messages.actions";
import { generateTips } from "@/lib/actions/personalTip.actions";
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
import { getCurrentMonthDates } from "@/lib/utils";
import { InteractiveMessage } from "@/type";
import { parse } from "date-fns";
import { eq } from "drizzle-orm";
import { after, NextResponse } from "next/server";

// Helper functions to create interactive responses
function interactiveFormMessage(message: string, callback: any, props: any) {
  return {
    type: "interactive",
    component: "Form",
    subtype: "",
    message,
    props,
    callback: callback,
  };
}

function interactiveCardMessage(
  message: string,
  data: any,
  subtype: "DISPLAY" | "ERROR" | "SUCCESS"
) {
  return {
    type: "interactive",
    component: "Card",
    subtype: subtype,
    message,
    props: data,
    callback: "", // No callback for simple display
  };
}

export async function POST(request: Request) {
  try {
    const { json, user } = await request.json();

    if (!json) {
      return NextResponse.json({
        success: false,
        message: "No data to process",
        status: 500,
      });
    }

    const { action, details, raw_input, additions } = json;

    // This will act as the message content for your message renderer
    let result;

    switch (action) {
      case "create_balance": {
        if (!details.name) {
          result = interactiveFormMessage(
            "Please provide a name to create a balance.",
            createBalance,
            {
              name: details.name || "",
              initialAmount: details.initial_amount || "",
            }
          );
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
          result = interactiveCardMessage(
            "Error creating balance",
            null,
            "ERROR"
          );
          break;
        }

        result = interactiveCardMessage(
          `Balance named "${balance.name}" was created successfully with initial amount: ${balance.current_balance}!`,
          {
            dataType: "balance",
            action: "create_balance",
            balance: balance,
          },
          "SUCCESS"
        );
        break;
      }

      case "update_balance": {
        if (!details.balance_id && (!additions || !additions.name)) {
          result = interactiveFormMessage(
            "Please provide the balance name to update the balance.",
            updateBalance,
            {
              balanceId: details.balance_id || "",
              name: details.name || "",
              currentBalance: details.current_balance || "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }

        if (!details.name && !details.current_balance) {
          result = interactiveFormMessage(
            `No possible updates found for balance "${additions.name}". Please provide what you want to change (name or current balance).`,
            updateBalance,
            {
              name: details.name || "",
              currentBalance: details.current_balance || "",
            }
          );
          break;
        }

        const updatedData = {
          balanceId: balanceId,
          name: details.name || null,
          currentBalance: details.current_balance || null,
        };
        const { success, updatedBalance } = await updateBalance(updatedData);
        if (!success) {
          result = interactiveCardMessage(
            `Error updating balance ${additions.name}`,
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          `${updatedBalance.name} was updated successfully!`,
          {
            dataType: "balance",
            action: "update_balance",
            balance: updatedBalance,
          },
          "SUCCESS"
        );
        break;
      }

      case "delete_balance": {
        if (!details.balance_id && (!additions || !additions.name)) {
          result = interactiveFormMessage(
            "Please provide the balance name to delete the balance.",
            deleteBalance,
            {
              balanceId: details.balance_id || "",
              name: additions ? additions.name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const deleteResponse = await deleteBalance(balanceId);
        if (!deleteResponse.success) {
          result = interactiveCardMessage(
            `Error deleting balance ${balanceId}`,
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          deleteResponse.message,
          {
            dataType: "balance",
            action: "delete_balance",
            balance: deleteResponse.deletedBalance,
          },
          "SUCCESS"
        );
        break;
      }

      case "get_balances": {
        const balancesList = await getBalances();
        result = interactiveCardMessage(
          "Retrieved balances",
          {
            dataType: "balances",
            action: "get_balances",
            balances: balancesList,
          },
          "DISPLAY"
        );
        break;
      }

      case "get_user_balances": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance name to get user balances.",
            getUserBalances,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const userBalances = await getUserBalances(balanceId);
        result = interactiveCardMessage(
          "Retrieved user balances",
          {
            dataType: "userBalances",
            action: "get_user_balances",
            userBalances: userBalances,
          },
          "DISPLAY"
        );
        break;
      }

      case "get_balance_by_id": {
        if (!details.balance_id && (!additions || !additions.name)) {
          result = interactiveFormMessage(
            "Please provide the balance name to get balance details.",
            getBalanceById,
            {
              balanceId: details.balance_id || "",
              name: additions ? additions.name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const balanceDetails = await getBalanceById(balanceId);
        result = interactiveCardMessage(
          "Balance details retrieved",
          {
            dataType: "balance",
            action: "get_balance_by_id",
            balance: balanceDetails,
          },
          "DISPLAY"
        );
        break;
      }

      case "get_budgets": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance name or ID to get budgets.",
            getBudgets,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
              type: details.type || "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const budgets = await getBudgetsWithNotifications(balanceId);
        const categories = await getCategories("expense");

        result = interactiveCardMessage(
          "Budgets retrieved",
          {
            dataType: "budgets",
            action: "get_budgets",
            budgets: budgets,
            categories: categories,
          },
          "DISPLAY"
        );
        break;
      }

      case "create_budget": {
        const missingFields: string[] = [];
        if (!details.type) missingFields.push("type");
        if (!details.balance_id && (!additions || !additions.balance_name))
          missingFields.push("balance_id or balance name");
        if (!details.amount) missingFields.push("amount");
        if (!details.start_date) missingFields.push("start_date");

        if (missingFields.length > 0) {
          result = interactiveFormMessage(
            `Missing required fields for budget creation: ${missingFields.join(
              ", "
            )}.`,
            createBudget,
            {
              type: details.type || "",
              balanceId: details.balance_id || "",
              amount: details.amount || "",
              startDate: details.start_date || "",
              categoryId: details.category_id || "",
              name: details.name || "",
              endDate: details.end_date || "",
              month: details.month || "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const {
          success,
          message: procMsg,
          budget,
        } = await createBudget({
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
          result = interactiveCardMessage(
            procMsg || "Error creating budget.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "Budget created successfully.",
          {
            dataType: "budget",
            budget: budget,
            action: "create_budget",
          },
          "SUCCESS"
        );
        break;
      }

      case "get_category_totals_by_balance": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance identifier to get category totals.",
            getCategoryTotalsByBalanceChatbot,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const { categoryTotals, categoriesList } =
          await getCategoryTotalsByBalanceChatbot(balanceId);
        result = interactiveCardMessage(
          "Category totals retrieved",
          {
            dataType: "categoryTotals",
            categoryTotals: categoryTotals,
            categories: categoriesList,
            action: "get_category_totals_by_balance",
          },
          "DISPLAY"
        );
        break;
      }

      case "create_recurring_transaction": {
        const missingFields: string[] = [];
        if (!details.amount) missingFields.push("amount");
        if (!details.description) missingFields.push("description");
        if (!details.date) missingFields.push("date");
        if (!details.balance_id && (!additions || !additions.balance_name))
          missingFields.push("balance_id or balance name");
        if (!details.category_id) missingFields.push("category_id");
        if (!details.type) missingFields.push("type");
        if (!details.recurrence_interval)
          missingFields.push("recurrence_interval");

        if (missingFields.length > 0) {
          result = interactiveFormMessage(
            `Missing required fields for creating recurring transaction: ${missingFields.join(
              ", "
            )}.`,
            createRecurringTransaction,
            {
              amount: details.amount || "",
              description: details.description || "",
              date: details.date || "",
              balanceId: details.balance_id || "",
              categoryId: details.category_id || "",
              type: details.type || "",
              recurrenceInterval: details.recurrence_interval || "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
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
          userId: user.id,
        });
        if (!createRecurringResponse.success) {
          result = interactiveCardMessage(
            createRecurringResponse.message ||
              "Error creating recurring transaction.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "Recurring transaction created successfully.",
          {
            dataType: "recurringTransaction",
            recurringTransaction: createRecurringResponse.recurringTransaction,
            action: "create_recurring_transaction",
          },
          "SUCCESS"
        );
        break;
      }

      case "get_recurring_transactions": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance identifier to get recurring transactions.",
            getRecurringTransactions,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const {
          success,
          message: errMsg,
          transactions,
        } = await getRecurringTransactions(balanceId);
        if (!success) {
          result = interactiveCardMessage(
            errMsg || "Error retrieving recurring transactions.",
            null,
            "ERROR"
          );
          break;
        }

        const categories = await getCategories("expense");
        result = interactiveCardMessage(
          "Recurring transactions retrieved",
          {
            dataType: "recurringTransactions",
            recurringTransactions: transactions,
            categories: categories,
            action: "get_recurring_transactions",
          },
          "DISPLAY"
        );
        break;
      }

      case "get_transactions": {
        if (
          (!details.balance_id && (!additions || !additions.balance_name)) ||
          !details.type
        ) {
          result = interactiveFormMessage(
            "Please provide the balance identifier and transaction type for getting transactions.",
            getTransactions,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
              type: details.type || "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const transactionsResponse = await getTransactions({
          balanceId,
          type: details.type,
          limit: parseFloat(details.limit) || undefined,
          offset: details.offset || null,
        });
        if (!transactionsResponse.success) {
          result = interactiveCardMessage(
            transactionsResponse.message || "Error retrieving transactions.",
            null,
            "ERROR"
          );
          break;
        }
        const categories = await getCategories();
        result = interactiveCardMessage(
          "Transactions retrieved",
          {
            dataType: "transactions",
            transactions: transactionsResponse.transactions,
            categories: categories,
            action: "get_transactions",
          },
          "DISPLAY"
        );
        break;
      }

      case "create_transaction": {
        const missingFields: string[] = [];
        if (!details.amount) missingFields.push("amount");
        if (!details.description) missingFields.push("description");
        if (!details.date) missingFields.push("date");
        if (!details.balance_id && (!additions || !additions.balance_name))
          missingFields.push("balance_id or balance name");
        if (!details.category_id) missingFields.push("category_id");
        if (!details.type) missingFields.push("type");

        if (missingFields.length > 0) {
          result = interactiveFormMessage(
            `Missing required fields for creating transaction: ${missingFields.join(
              ", "
            )}.`,
            createTransaction,
            {
              amount: details.amount || "",
              description: details.description || "",
              date: details.date || "",
              balanceId: details.balance_id || "",
              categoryId: details.category_id || "",
              type: details.type || "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
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
          result = interactiveCardMessage(
            createTransactionResponse.message || "Error creating transaction.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "Transaction created successfully.",
          {
            dataType: "transaction",
            transaction: createTransactionResponse.transaction,
          },
          "SUCCESS"
        );
        break;
      }

      case "update_user_profile": {
        if (
          !details.name &&
          !details.color &&
          !details.default_balance_id &&
          (!additions || !additions.default_balance_name)
        ) {
          result = interactiveFormMessage(
            "There is nothing to update.",
            updateUserProfile,
            {
              name: details.name || "",
              color: details.color || "",
              defaultBalanceId: details.default_balance_id || "",
            }
          );
          break;
        }
        if (details.color) {
          const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
          if (!hexColorRegex.test(details.color)) {
            result = interactiveFormMessage(
              "The 'color' field must be in hex format (e.g., #ffffff).",
              updateUserProfile,
              {
                color: details.color,
              }
            );
            break;
          }
        }
        let balanceId = details.default_balance_id || null;
        if (!balanceId && additions && additions.default_balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.default_balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
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
        const updateResponse = await updateUserProfileChatbot(updates);
        if (!updateResponse.success) {
          result = interactiveCardMessage(
            updateResponse.message || "Error updating user profile.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "User profile updated successfully.",
          {
            dataType: "user",
            user: updateResponse.user,
          },
          "SUCCESS"
        );
        break;
      }

      case "analysis_enable": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance identifier to enable forecast feature.",
            enableForecast,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const {
          success,
          message: procMsg,
          balance,
        } = await enableForecast(balanceId);
        const { start, end } = getCurrentMonthDates();
        await calculateForecast({
          balanceId,
          startDate: start,
          endDate: end,
          periodType: "MONTH",
        });
        await generateTips(balanceId);
        if (!success) {
          result = interactiveCardMessage(
            procMsg || "Error enabling forecast.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "Forecast enabled successfully.",
          {
            dataType: "balance",
            balance: balance,
          },
          "SUCCESS"
        );
        break;
      }

      case "analysis_perform": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance identifier to perform analysis.",
            calculateForecast,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const { start, end } = getCurrentMonthDates();
        const foreCastResult = await calculateForecast({
          balanceId,
          startDate: start,
          endDate: end,
          periodType: "MONTH",
        });
        const tipResult = await generateTips(balanceId);
        if (!foreCastResult.success || !tipResult.success) {
          result = interactiveCardMessage(
            (foreCastResult.message || "") + (tipResult.message || "") ||
              "Error performing analysis.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "Analysis performed successfully.",
          {
            dataType: "forecast&&personalTips",
            forecast: foreCastResult.forecast,
            personalTips: tipResult.result,
          },
          "SUCCESS"
        );
        break;
      }

      case "get_analysis": {
        if (!details.balance_id && (!additions || !additions.balance_name)) {
          result = interactiveFormMessage(
            "Please provide the balance identifier to retrieve analysis.",
            loadAnalysisTab,
            {
              balanceId: details.balance_id || "",
              balanceName: additions ? additions.balance_name : "",
            }
          );
          break;
        }
        let balanceId = details.balance_id;
        if (!balanceId && additions && additions.balance_name) {
          const {
            success,
            message: errMsg,
            balance,
          } = await getUserBalanceByName(additions.balance_name);
          if (!success) {
            result = interactiveCardMessage(errMsg, null, "ERROR");
            break;
          }
          balanceId = balance.id;
        }
        const isEnable = await db
          .select({ isForecastingEnabled: balances.is_forecasting_enabled })
          .from(balances)
          .where(eq(balances.id, balanceId))
          .limit(1);
        if (!isEnable) {
          result = interactiveCardMessage(
            "The balance has not enabled Analysis feature.",
            null,
            "ERROR"
          );
          break;
        }
        const { success, forecast, personalTip } = await loadAnalysisTab(
          balanceId
        );
        if (!success) {
          result = interactiveCardMessage(
            "Error retrieving analysis data.",
            null,
            "ERROR"
          );
          break;
        }
        result = interactiveCardMessage(
          "Analysis data retrieved.",
          {
            dataType: "forecast&&personalTips",
            forecast,
            personalTips: personalTip,
          },
          "DISPLAY"
        );
        break;
      }

      default: {
        result = interactiveCardMessage(
          `Action "${action}" is not supported.`,
          null,
          "ERROR"
        );
        break;
      }
    }

    after(async () => {
      await saveMessage({
        userId: user.id,
        sender: "bot",
        message: result as InteractiveMessage,
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: interactiveCardMessage(
        "Error processing command",
        null,
        "ERROR"
      ),
      status: 500,
    });
  }
}
