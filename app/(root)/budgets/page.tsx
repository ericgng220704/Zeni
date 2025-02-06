import { auth } from "@/auth";
import BudgetPage from "@/components/budgets/BudgetPage";
import { getBalances } from "@/lib/actions/balance.actions";
import { getCategories } from "@/lib/actions/category.actions";

export default async function Budget() {
  const session = await auth();

  if (!session?.user) return;
  const balances = await getBalances();
  const categories = await getCategories("expense");

  return (
    <main className="main-container">
      <BudgetPage
        balances={balances}
        categories={categories}
        user={session.user}
      />
    </main>
  );
}
