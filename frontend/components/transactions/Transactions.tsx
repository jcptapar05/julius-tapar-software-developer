"use client";

import React, { useEffect, useState } from "react";
import { formatEther } from "ethers";
import { ArrowUpRight, Wallet } from "lucide-react";
import { useAddressStore } from "@/stores/address";
import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export function Transactions() {
  const address = useAddressStore((state: any) => state.address);
  const [transactions, setTransactions] = useState<any[]>([]);

  const formatEthValue = (wei: any) => {
    return (BigInt(wei) / BigInt(10) ** BigInt(18)).toString();
  };

  const formatAddress = (address: any) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const fetchTxHistory = async () => {
    // const ad = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log("Etherscan data:", data);
      if (data.status === "1" && Array.isArray(data.result)) {
        setTransactions(data.result);
      } else {
        // console.error("Etherscan error:", data);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTxHistory();
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Transaction History
          </h1>
          <p className="text-slate-400 text-lg">
            {transactions.length > 0 ? (
              <>
                Showing{" "}
                <span className="text-blue-400 font-semibold">
                  {transactions.length}
                </span>{" "}
                transaction{transactions.length !== 1 ? "s" : ""}
              </>
            ) : (
              "No transactions found"
            )}
          </p>
        </div>

        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div
                key={tx.hash}
                className="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>

                <div className="relative z-10 space-y-4">
                  {/* Top Section */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition">
                        <ArrowUpRight className="w-6 h-6 text-white" />
                      </div>

                      {/* Address Flow */}
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-300 font-medium text-sm mb-1">
                          {formatAddress(tx.from)}{" "}
                          <span className="text-slate-500 mx-1">→</span>{" "}
                          {formatAddress(tx.to)}
                        </p>
                        <p className="text-xs text-slate-500 font-mono truncate">
                          {tx.hash}
                        </p>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                        {formatEthValue(tx.value)} ETH
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linear-to-r from-slate-700/50 to-transparent"></div>

                  {/* Bottom Section */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        From
                      </p>
                      <p className="text-sm text-slate-300 font-mono break-all">
                        {tx.from}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        To
                      </p>
                      <p className="text-sm text-slate-300 font-mono break-all">
                        {tx.to}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center min-h-96 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 text-lg font-medium">
                {address
                  ? "No transactions found"
                  : "Connect wallet to view transactions"}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                {address
                  ? "Try a different address"
                  : "Click the connect button above"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
