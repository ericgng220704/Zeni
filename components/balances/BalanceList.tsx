import BalanceCard from "./BalanceCard";

export default function BalanceList({
  balances,
  setBalances,
}: {
  balances: any;
  setBalances: React.SetStateAction<any>;
}) {
  console.log(balances);
  return (
    <div className="flex flex-col justify-center items-center md:grid md:grid-cols-2 gap-4 my-8">
      {balances.map((balance: any) => (
        <BalanceCard
          balance={balance}
          key={balance.id}
          setBalances={setBalances}
        />
      ))}
    </div>
  );
}
