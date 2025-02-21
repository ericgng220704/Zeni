"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getIconByName } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ImInfinite } from "react-icons/im";
import { FaGripVertical } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaCirclePause } from "react-icons/fa6";
import { FaCirclePlay } from "react-icons/fa6";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteBudget, setBudgetStatus } from "@/lib/actions/budget.actions";
import { Budget, Category } from "@/type";
import { useToast } from "@/hooks/use-toast";

export default function BudgetTable({
  budgets,
  setIsOpen,
  setSelectedBudget,
  type,
  onBudgetCreated,
  onBudgetDeleted,
  categories,
}: {
  budgets: Budget[];
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBudget: React.Dispatch<React.SetStateAction<Budget | undefined>>;
  type: "MONTHLY" | "CATEGORY" | "CUSTOM";
  onBudgetCreated: (budget: any) => void;
  onBudgetDeleted: (budget: any) => void;
  categories: Category[];
}) {
  const { toast } = useToast();

  async function handleToggleBudgetStatus(
    balanceId: string,
    newStatus: "ACTIVE" | "EXPIRED" | "CANCELED"
  ) {
    try {
      const { success, message, updatedBudget } = await setBudgetStatus(
        balanceId,
        newStatus
      );

      if (success) {
        toast({
          description: message,
        });
        onBudgetCreated(updatedBudget);
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        variant: "destructive",
        description: "Oops something went wrong, please try again!",
      });
    }
  }

  async function hanldeDeleteBudget(budgetId: string) {
    try {
      const { success, message, deletedBudget } = await deleteBudget(budgetId);

      if (success) {
        toast({
          description: message,
        });
        onBudgetDeleted(deletedBudget);
      } else {
        toast({
          variant: "destructive",
          description: message,
        });
      }
    } catch (e) {
      console.log(e);
      toast({
        variant: "destructive",
        description: "Oops something went wrong, please try again!",
      });
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {type === "CATEGORY" && (
            <TableHead className="sm:w-[170px] ">Category</TableHead>
          )}
          {type === "MONTHLY" && (
            <TableHead className="sm:w-[170px] ">Period</TableHead>
          )}
          {type === "CUSTOM" && (
            <TableHead className="sm:w-[170px] ">Name</TableHead>
          )}
          <TableHead className="hidden sm:table-cell w-[200px]">
            Expiry date
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {budgets.map((budget: Budget) => {
          let Icon;
          const category = categories.find(
            (category) => category.id === budget.category_id
          );
          if (type === "CATEGORY") {
            Icon = getIconByName(category?.icon || "");
          } else {
            Icon = null;
          }
          return (
            <TableRow
              key={budget.id}
              className={`${
                budget.status === "ACTIVE" ? "" : "!text-gray-400"
              } hover:!bg-white`}
            >
              {type === "CATEGORY" && (
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8 text-sm">
                      <AvatarFallback
                        style={{
                          backgroundColor: category?.color,
                        }}
                      >
                        {Icon ? <Icon size={14} className="" /> : null}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-normal">{category?.name}</p>
                  </div>
                </TableCell>
              )}

              {type === "MONTHLY" && (
                <TableCell className="flex items-center gap-1">
                  <span className="font-semibold">
                    {budget.month ? budget.month : <ImInfinite size={16} />}
                  </span>{" "}
                  <span className="text-gray-500 text-xs">months</span>
                </TableCell>
              )}
              {type === "CUSTOM" && (
                <TableCell className="flex items-center gap-1">
                  <span className="font-semibold">{budget.name}</span>
                </TableCell>
              )}
              <TableCell
                className={`hidden sm:table-cell w-[200px] ${
                  budget.status === "ACTIVE"
                    ? "text-gray-600"
                    : "!text-gray-400"
                }`}
              >
                {formatDate(
                  budget.end_date ? budget.end_date.toString() : null
                )}
              </TableCell>
              <TableCell
                className={`${
                  budget.status === "ACTIVE"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {budget.status}
              </TableCell>
              <TableCell className="text-right font-medium">
                {budget.amount}
              </TableCell>
              <TableCell className="w-12 text-gray-500 hover:text-gray-800 cursor-pointer">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <FaGripVertical />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <DropdownMenuItem
                            onClick={() => {
                              setIsOpen((prev) => !prev);
                              setSelectedBudget(budget);
                            }}
                            className="flex items-center justify-between"
                          >
                            <span>Edit</span>
                            <FaRegEdit className="text-gray-700" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent className="!bg-gray-900">
                          <p className="text-gray-200">Edit budget</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenuSeparator />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <DropdownMenuItem
                            className="flex items-center justify-between"
                            onClick={() => {
                              const newStatus =
                                budget.status === "CANCELED"
                                  ? "ACTIVE"
                                  : "CANCELED";
                              handleToggleBudgetStatus(budget.id, newStatus);
                            }}
                          >
                            <span>
                              {budget.status === "ACTIVE"
                                ? "Pause"
                                : "Activate"}
                            </span>{" "}
                            {budget.status === "ACTIVE" ? (
                              <FaCirclePause className="text-gray-600" />
                            ) : (
                              <FaCirclePlay className="text-gray-600" />
                            )}
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent className="!bg-gray-900">
                          <p className="text-gray-200">
                            Put the budget status to `&quot;`canceled`&quot;`
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenuSeparator />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <DropdownMenuItem
                            className="flex items-center justify-between"
                            onClick={() => hanldeDeleteBudget(budget.id)}
                          >
                            <span>Delete</span>{" "}
                            <MdDelete className="text-gray-600" />
                          </DropdownMenuItem>
                        </TooltipTrigger>
                        <TooltipContent className="!bg-gray-900">
                          <p className="text-gray-200">Delete budget</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
