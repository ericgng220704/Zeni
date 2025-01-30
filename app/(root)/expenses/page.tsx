import TransactionPage from "@/components/transactions/TransactionPage";

export default function Expense() {
  return (
    <main className="main-container">
      <TransactionPage type="expense" />
    </main>
  );
}
