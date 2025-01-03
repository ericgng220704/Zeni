"use server";

import { ID, Models, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export async function createTransaction({
  amount,
  description,
  date,
  balanceId,
  categoryId,
  type,
  path,
}: {
  amount: number;
  description: string;
  date: Date;
  balanceId: string;
  categoryId: string;
  type: string;
  path: string;
}) {
  const { databases } = await createAdminClient();

  try {
    const transactionDocument = {
      amount,
      description,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      date,
      balanceId,
      categoryId,
      type,
    };

    const newTransaction = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      ID.unique(),
      transactionDocument
    );

    revalidatePath(path);

    return parseStringify(newTransaction);
  } catch (e) {
    handleError(e, "Failed to create new transaction!");
  }
}

const createQueries = (
  balanceId: string,
  type: string,
  sort: string,
  limit?: number
) => {
  const queries = [];
  if (balanceId) queries.push(Query.equal("balanceId", balanceId));
  if (type) queries.push(Query.equal("type", type));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
    );
  }

  return queries;
};

export async function getTransaction({
  balanceId,
  type,
  sort = "$createdAt-desc",
  limit,
}: {
  balanceId: string;
  type: string;
  sort: string;
  limit: number;
}) {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found!");

    const queries = createQueries(balanceId, type, sort, limit);

    const transactions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      queries
    );

    return parseStringify(transactions);
  } catch (e) {
    handleError(e, "Failed to get transactions!");
  }
}

export async function deleteTransaction({
  fileId,
  path,
}: {
  fileId: string;
  path: string;
}) {
  const { databases } = await createAdminClient();

  try {
    const deletedTransaction = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.transactionsCollectionId,
      fileId
    );

    revalidatePath(path);
    return parseStringify(deletedTransaction);
  } catch (e) {
    handleError(e, "Failed to delete transaction!");
  }
}
