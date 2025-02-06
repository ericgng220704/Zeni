import {
  createBalance,
  deleteBalance,
  getBalanceById,
  getBalances,
  getUserBalanceByName,
  getUserBalances,
  updateBalance,
} from "@/lib/actions/balance.actions";
import { NextRequest, NextResponse } from "next/server";

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
          return;
        }
        const currentBalance = details.initial_amount
          ? details.initial_amount
          : "0";

        const { success, balance } = await createBalance({
          name: details.name,
          currentBalance: currentBalance,
        });

        if (!success) {
          result = {
            success: false,
            message: "Error creating balance",
          };
          return;
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
