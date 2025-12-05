"use client";

import React, { useEffect, useState } from "react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
        axios.get(`${API_URL}/gas`),
        axios.get(`${API_URL}/block`),
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
      const balanceRes = await axios.get(`${API_URL}/balance/${addr}`);
      setData((prev) => ({
        ...prev,
        balance: balanceRes.data?.balanceEth || "0",
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Dashboard
        </h1>

        <div className="mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {connectedAddress ? "Connected Wallet" : "Search ETH Wallet"}
              </label>
              <input
                type="text"
                value={address || connectedAddress}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                disabled={!!connectedAddress}
                onKeyPress={(e) => e.key === "Enter" && handleConnect()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="flex gap-2">
              {!connectedAddress ? (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
                >
                  {loading ? "Loading..." : "Search"}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {connectedAddress && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Connected Account</p>
              <p className="font-mono text-sm">{formatAddress(connectedAddress)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {connectedAddress && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Wallet Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {parseFloat(data.balance || "0").toFixed(4)} ETH
              </p>
              <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                {connectedAddress}
              </p>
            </div>
          )}

          {!connectedAddress && (
            <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center text-center">
              <p className="text-gray-600 font-medium">
                Connect a wallet to view your balance
              </p>
            </div>
          )}

          {data.gas && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">Gas Prices</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Safe (Base)
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {data.gas.baseFeePerGasGwei} Gwei
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Priority
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {data.gas.priorityFeePerGasGwei} Gwei
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Max Fee
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {data.gas.maxFeePerGasGwei} Gwei
                  </p>
                </div>
              </div>
            </div>
          )}

          {data.block && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Latest Block</p>
              <p className="text-3xl font-bold text-blue-600">
                #{data.block.blockNumber.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">Block Number</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}