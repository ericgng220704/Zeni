export const appwriteConfig = {
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,
  transactionsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_TRANSACTIONS_COLLECTION!,
  categoriesCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION!,
  balancesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BALANCES_COLLECTION!,
  secretKey: process.env.NEXT_APPWRITE_KEY!,
};
