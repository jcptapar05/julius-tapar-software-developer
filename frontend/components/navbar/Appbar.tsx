"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import React, { useEffect } from "react";
import { Wallet, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAddressStore } from "@/stores/address";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (
        event: string,
        callback: (accounts: string[]) => void
      ) => void;
    };
  }
}

export function Appbar() {
  const storeAddress = useAddressStore((state) => state.address);
  const setStoreAddress = useAddressStore((state) => state.setAddress);

  const [localAddress, setLocalAddress] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const navItems = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "My Transactions", href: "/my-transactions" },

    { title: "Mint", href: "/mint" },
    {  title: "Mint History", href: "/mint-history" },
  ];

  const connectToWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = (await window.ethereum.request({
          method: "eth_requestAccounts",
        })) as string[];

        const connectedAccount = accounts[0];
        console.log("Connected account:", connectedAccount);
        setLocalAddress(connectedAccount);
        setStoreAddress(connectedAccount);

        // Verify store was updated
        console.log(
          "Store address after setting:",
          useAddressStore.getState().address
        );
      } catch (error: any) {
        console.error("Error connecting to wallet:", error);
        toast("Connection Error", {
          description: error.message || "Failed to connect wallet",
        });
      }
    } else {
      toast("MetaMask is not installed", {
        description: "Please install MetaMask to connect your wallet",
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const initializeWallet = async () => {
      try {
        const accounts = (await window.ethereum!.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts.length > 0) {
          const account = accounts[0];
          setLocalAddress(account);
          setStoreAddress(account);
          console.log("Initialized with account:", account);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    initializeWallet();

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts);

      if (accounts.length > 0) {
        const newAccount = accounts[0];
        setLocalAddress(newAccount);
        setStoreAddress(newAccount);
        console.log("Account changed to:", newAccount);
        console.log(
          "Store address after change:",
          useAddressStore.getState().address
        );
      } else {
        setLocalAddress(null);
        setStoreAddress(null);
        console.log("Wallet disconnected");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [setStoreAddress]);

  useEffect(() => {
    console.log("Store address updated:", storeAddress);
    if (storeAddress !== localAddress) {
      setLocalAddress(storeAddress);
    }
  }, [storeAddress]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    const addressToCopy = localAddress || storeAddress;
    if (addressToCopy) {
      navigator.clipboard.writeText(addressToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Use storeAddress as the source of truth for display
  const displayAddress = localAddress || storeAddress;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            Etherscan Explorer
          </Link>
        </div>
        <ul className="flex items-center gap-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {displayAddress ? (
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 hover:border-slate-600 transition">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">
                {formatAddress(displayAddress)}
              </span>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-slate-700/50 rounded transition"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          ) : (
            <Button
              onClick={connectToWallet}
              className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
