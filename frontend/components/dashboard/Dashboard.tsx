"use client";

import React, { useEffect, useState } from "react";
import { Zap, Blocks, Wallet, TrendingUp, Loader } from "lucide-react";
import axios from "axios";

interface GasData {
  baseFeePerGasGwei: string;
  priorityFeePerGasGwei: string;
  maxFeePerGasGwei: string;
}

interface BlockData {
  blockNumber: number;
}

interface DashboardData {
  gas: GasData | null;
  block: BlockData | null;
  balance: string | null;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    gas: null,
    block: null,
    balance: null,
  });
  const [address, setAddress] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurrentData();
    const interval = setInterval(fetchCurrentData, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (connectedAddress && connectedAddress.startsWith("0x")) {
      fetchBalance(connectedAddress);
    }
  }, [connectedAddress]);

  const fetchCurrentData = async () => {
    try {
      const [gasRes, blockRes] = await Promise.all([
        axios.get("http://localhost:3001/gas"),
        axios.get("http://localhost:3001/block"),
      ]);

      setData((prev) => ({
        ...prev,
        gas: gasRes.data,
        block: blockRes.data,
      }));
    } catch (err) {
      console.error("Error fetching current data:", err);
    }
  };

  const fetchBalance = async (addr: string) => {
    try {
      const balanceRes = await axios.get(
        `http://localhost:3001/balance/${addr}`
      );
      setData((prev) => ({
        ...prev,
        balance: balanceRes.data?.balance || "0",
      }));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setData((prev) => ({
        ...prev,
        balance: "0",
      }));
    }
  };

  const handleConnect = () => {
    if (!address || !address.startsWith("0x")) {
      setError("Please enter a valid Ethereum address");
      return;
    }
    setError("");
    setConnectedAddress(address);
  };

  const handleDisconnect = () => {
    setConnectedAddress("");
    setAddress("");
    setData((prev) => ({
      ...prev,
      balance: null,
    }));
  };

  const formatBalance = (balance: string) => {
    try {
      const num = parseFloat(balance) / 1e18;
      return num.toFixed(4);
    } catch {
      return "0";
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Dashboard
          </h1>
        </div>

        <div className="mb-8 group bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                {connectedAddress ? "Connected Wallet" : "Search ETH Wallet"}
              </label>
              <input
                type="text"
                value={address || connectedAddress}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                disabled={!!connectedAddress}
                onKeyPress={(e) => e.key === "Enter" && handleConnect()}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {!connectedAddress ? (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-6 py-3 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Loading
                      </>
                    ) : (
                      "Search ETH Wallet"
                    )}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="flex-1 sm:flex-none px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {connectedAddress && (
            <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-sm text-slate-400">
                Connected:{" "}
                <span className="text-emerald-400 font-semibold font-mono">
                  {formatAddress(connectedAddress)}
                </span>
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {connectedAddress && (
            <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Wallet Balance
                  </h3>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-semibold">
                    ETH Balance
                  </p>
                  <p className="text-4xl font-bold bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                    {formatBalance(data.balance || "0")}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">Ethereum</p>
                  <p className="text-xs text-slate-400 mt-3 font-mono break-all">
                    {connectedAddress}
                  </p>
                </div>
              </div>
            </div>
          )}
          {!connectedAddress && (
            <div className="flex flex-col items-center justify-center min-h-32 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium">
                Connect a wallet to view your balance
              </p>
            </div>
          )}

          {data.gas && (
            <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-yellow-500 to-orange-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-yellow-500/20 transition">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Gas Prices
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                      Safe
                    </p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {data.gas.baseFeePerGasGwei}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Gwei</p>
                  </div>
                  <div className="h-px bg-linear-to-r from-slate-700/50 to-transparent"></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                      Priority
                    </p>
                    <p className="text-2xl font-bold text-blue-400">
                      {data.gas.priorityFeePerGasGwei}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Gwei</p>
                  </div>
                  <div className="h-px bg-linear-to-r from-slate-700/50 to-transparent"></div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                      Max Fee
                    </p>
                    <p className="text-2xl font-bold text-red-400">
                      {data.gas.maxFeePerGasGwei}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Gwei</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data.block && (
            <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/20 transition">
                    <Blocks className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Latest Block
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                      Block Number
                    </p>
                    <p className="text-3xl font-bold text-purple-400">
                      #{data.block.blockNumber.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
