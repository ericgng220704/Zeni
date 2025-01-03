import { Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { getCurrentUser } from "./user.actions";
import { parseStringify } from "../utils";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export async function getBalances() {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found!");

    const balances = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.balancesCollectionId,
      [Query.contains("users", [currentUser.userId])]
    );

    return parseStringify(balances);
  } catch (e) {
    handleError(e, "Failed to get balances");
  }
}
