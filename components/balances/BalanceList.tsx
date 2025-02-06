import BalanceCard from "./BalanceCard";

export default function BalanceList({
  balances,
  setBalances,
}: {
  balances: any;
  setBalances: React.SetStateAction<any>;
}) {
  return (
    <div className="flex flex-col justify-center items-center  gap-4 my-8 xl:grid xl:grid-cols-2 ">
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
