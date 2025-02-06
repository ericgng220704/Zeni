// RecurringTransactionsTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getIconByName } from "@/lib/utils";
import { RecurringTransaction, Category } from "@/type";
import { updateRecurringTransactionStatus } from "@/lib/actions/recurringTransaction.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface RecurringTransactionsTableProps {
  recurringTransactions: RecurringTransaction[];
  onTransactionUpdated: (transaction: RecurringTransaction) => void;
  onTransactionDeleted: (transaction: RecurringTransaction) => void;
  categories?: Category[];
}

// Helper function to format the recurrence interval (assumed to be in ms)
function formatInterval(msStr: string): string {
  const ms = Number(msStr);
  // Convert to days (adjust logic as needed)
  const days = ms / (1000 * 60 * 60 * 24);
  if (days >= 1 && days % 1 === 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  } else {
    const hours = ms / (1000 * 60 * 60);
    return `${hours.toFixed(0)} hour${hours > 1 ? "s" : ""}`;
  }
}

export default function RecurringTransactionsTable({
  recurringTransactions,
  onTransactionUpdated,
  categories,
}: RecurringTransactionsTableProps) {
  // Control the confirmation dialog state
  const [isOpen, setIsOpen] = useState(false);
  // Hold the transaction that is about to be canceled
  const [selectedTransaction, setSelectedTransaction] = useState<
    RecurringTransaction | undefined
  >();

  async function handleToggleTransactionStatus(
    transactionId: string,
    newStatus: "ACTIVE" | "CANCELED"
  ) {
    try {
      const { updatedTransaction, success } =
        await updateRecurringTransactionStatus({
          recurringTransactionId: transactionId,
          status: newStatus,
        });
      onTransactionUpdated(updatedTransaction);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {categories && (
              <TableHead className="sm:w-[170px]">Category</TableHead>
            )}
            <TableHead>Interval</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurringTransactions.map((transaction) => {
            let category;
            let Icon;
            if (categories && transaction.category_id) {
              category = categories.find(
                (cat) => cat.id === transaction.category_id
              );
              Icon = getIconByName(category?.icon || "");
            }
            return (
              <TableRow
                key={transaction.id}
                className={`${
                  transaction.status === "ACTIVE" ? "" : "!text-gray-400"
                } hover:!bg-white`}
              >
                {categories && (
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={16} className="text-gray-500" />}
                      <p className="font-normal">{category?.name || "N/A"}</p>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <span className="hidden md:inline-block">Every</span>{" "}
                  {formatInterval(transaction.interval)}
                </TableCell>
                <TableCell
                  className={
                    transaction.status === "ACTIVE"
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  <Select
                    // Use a controlled value based on the transaction status
                    value={transaction.status}
                    onValueChange={(value: "ACTIVE" | "CANCELED") => {
                      if (
                        value === "CANCELED" &&
                        transaction.status !== "CANCELED"
                      ) {
                        // Open the confirmation dialog
                        setSelectedTransaction(transaction);
                        setIsOpen(true);
                      } else if (
                        value === "ACTIVE" &&
                        transaction.status !== "ACTIVE"
                      ) {
                        // Directly update if activating
                        handleToggleTransactionStatus(transaction.id, "ACTIVE");
                      }
                    }}
                  >
                    <SelectTrigger className="!pl-0 w-fit md:!w-[70px] outline-none border-none shadow-none">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CANCELED">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {transaction.amount}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Confirmation Dialog for Cancelation */}
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          // If the dialog is closed (user cancelled), clear the temporary selection.
          if (!open) setSelectedTransaction(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Cancelation</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-gray-800">
                This will set the recurring transaction to{" "}
                <span className="text-gray-900">"canceled"</span> state and will
                be permanently deleted until the next execution time.
              </span>
              <br />
              <br />
              Note: You can reverse the cancelation by reactivating it before
              the next execution time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedTransaction) {
                  // Proceed with cancelation only after confirmation.
                  handleToggleTransactionStatus(
                    selectedTransaction.id,
                    "CANCELED"
                  );
                  // Close the dialog and clear temporary state.
                  setIsOpen(false);
                  setSelectedTransaction(undefined);
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
