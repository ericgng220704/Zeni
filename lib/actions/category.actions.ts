import { Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { getCurrentUser } from "./user.actions";
import { parseStringify } from "../utils";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export async function getCategories(type: string) {
  const { databases } = await createAdminClient();

  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.contains("type", type)]
    );

    return parseStringify(categories);
  } catch (e) {
    handleError(e, "Failed to get balances");
  }
}
