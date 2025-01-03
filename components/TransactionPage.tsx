// TransactionPage.tsx (Server Component)
import { capitalizeFirstLetter } from "@/lib/utils";
import TransactionForm from "./TransactionForm";
import { getBalances } from "@/lib/actions/balance.actions";
import { getCategories } from "@/lib/actions/category.actions";

export default async function TransactionPage({ type }: { type: string }) {
  const balances = await getBalances();
  const categories = await getCategories(type);

  return (
    <div className="flex items-center justify-between px-2 md:px-5 lg:px-10">
      <h1 className="h1">{capitalizeFirstLetter(type)}</h1>
      {balances && (
        <TransactionForm
          type={type}
          balances={balances.documents}
          categories={categories.documents}
        />
      )}
    </div>
  );
}
