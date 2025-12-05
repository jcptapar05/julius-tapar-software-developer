"use client";

import React, { useEffect, useState } from "react";
import { useAddressStore } from "@/stores/address";
import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;

export function Transactions() {
  const address = useAddressStore((state: any) => state.address);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatEthValue = (wei: any) => {
    try {
      return (BigInt(wei) / BigInt(10) ** BigInt(18)).toString();
    } catch {
      return "0";
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchTxHistory = async () => {
    setLoading(true);
    setError("");

    const url = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&page=1&offset=10&sort=desc&apikey=${API_KEY}`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (data.status === "1" && Array.isArray(data.result)) {
        setTransactions(data.result);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTxHistory();
    }
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Transaction History
          </h1>
          <p className="text-gray-600">
            Please connect your wallet to view transaction history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Transaction History
        </h1>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="bg-gray-100 p-4 rounded-lg hover:shadow-md transition"
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Transaction Flow</p>
                  <p className="font-semibold text-gray-800">
                    {formatAddress(tx.from)}
                    <span className="text-gray-500 mx-2">→</span>
                    {formatAddress(tx.to)}
                  </p>
                  <a
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-xs truncate block mt-1"
                    title={tx.hash}
                  >
                    {formatAddress(tx.hash)}
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                      Amount
                    </p>
                    <p className="font-bold text-gray-800">
                      {formatEthValue(tx.value)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                      Gas Used
                    </p>
                    <p className="font-bold text-gray-800">{tx.gas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                      Status
                    </p>
                    <p
                      className={`font-bold ${
                        tx.isError === "0"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.isError === "0" ? "Success" : "Failed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">
                      Date
                    </p>
                    <p className="font-bold text-gray-800">
                      {formatDate(tx.timeStamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-100 rounded-lg">
            <p className="text-gray-600 font-medium">
              No transactions found for this address
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Try searching for a different address
            </p>
          </div>
        )}

        {transactions.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {transactions.length} recent transactions
          </div>
        )}
      </div>
    </div>
  );
}