"use client";

import BalanceList from "./BalanceList";
import BalanceForm from "./BalanceForm";
import { useEffect, useState } from "react";
import { getBalances } from "@/lib/actions/balance.actions";

export default function BalancePage() {
  const [balances, setBalances] = useState<any[]>([]);

  useEffect(() => {
    async function fetchBalances() {
      try {
        // Directly get the parsed JSON object
        const data = await getBalances();
        if (data.length === 0) return;

        setBalances(data);
      } catch (e) {
        console.error("Error fetching balances:", e);
      }
    }

    fetchBalances();
  }, []);
  return (
    <div className="px-2 md:px-5 lg:px-10 mb-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="h1">Balances</h1>

        <BalanceForm setBalances={setBalances} />
      </div>
      <BalanceList balances={balances} setBalances={setBalances} />
    </div>
  );
}
