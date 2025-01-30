import { auth } from "@/auth";
import BalanceDetailPage from "@/components/balances/BalanceDetailPage";

export default async function BalanceDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const balanceId = (await params).id;
  const session = await auth();

  if (!session?.user) return;

  return (
    <main className="main-container">
      <BalanceDetailPage balanceId={balanceId} user={session.user} />
    </main>
  );
}
