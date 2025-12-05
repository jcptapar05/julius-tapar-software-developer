"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAddressStore } from "@/stores/address";
import axios from "axios";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function MintingApp() {
  const { address: storedAddress, setAddress } = useAddressStore();
  const [balance, setBalance] = useState("0");
  const [owner, setOwner] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [mintAmount, setMintAmount] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (storedAddress && connected) {
      loadContractData(storedAddress);
    }
  }, [storedAddress, connected]);

  const checkConnection = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        setError("Please install MetaMask");
        return;
      }

      const accounts = (await ethereum.request({
        method: "eth_accounts",
      })) as string[];

      if (accounts.length > 0) {
        setConnected(true);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        setError("Please install MetaMask");
        return;
      }

      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      setConnected(true);
      setError("");
    } catch (err) {
      setError("Failed to connect wallet");
    }
  };

  const loadContractData = async (userAccount: string) => {
    try {
      // Validate contract address
      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "") {
        setError(
          "Contract address not configured. Check NEXT_PUBLIC_CONTRACT_ADDRESS environment variable."
        );
        return;
      }

      if (!ethers.isAddress(CONTRACT_ADDRESS)) {
        setError("Invalid contract address format.");
        return;
      }

      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      const provider = new ethers.BrowserProvider(ethereum);

      // Check if contract exists at the address
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        setError(
          "No contract found at this address. Check that you are on the correct network and contract address is correct."
        );
        return;
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      try {
        const ownerAddress = (await contract.owner()) as string;
        console.log("Contract owner address:", ownerAddress);
        setOwner(ownerAddress);
        setIsOwner(userAccount.toLowerCase() === ownerAddress.toLowerCase());
      } catch (err) {
        console.error("Error calling owner():", err);
        setError(
          "Unable to fetch contract owner. Contract may not implement the Ownable interface."
        );
        return;
      }

      try {
        const bal = (await contract.balanceOf(userAccount)) as bigint;
        setBalance(ethers.formatUnits(bal, 18));
      } catch (err) {
        console.error("Error fetching balance:", err);
        setError(
          "Unable to fetch balance. There may be an issue with the contract."
        );
      }
    } catch (err: any) {
      console.error("Error loading contract data:", err);
      setError(
        "Failed to load contract data: " + (err.message || "Unknown error")
      );
    }
  };

  const handleMint = async () => {
    if (!mintAmount || !mintAddress) {
      setError("Please fill in all fields");
      return;
    }

    if (!ethers.isAddress(mintAddress)) {
      setError("Invalid recipient address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        setError("Please install MetaMask");
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const amount = ethers.parseUnits(mintAmount, 18);
      const tx = await contract.mint(mintAddress, amount);

      setSuccess("Minting transaction sent! Waiting for confirmation...");

      const receipt = await tx.wait();

      // Save to backend database after confirmation
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

        const mintData = {
          txHash: tx.hash,
          from: signerAddress,
          to: mintAddress,
          amount: mintAmount,
          tokenSymbol: "SMT",
        };

        // Save mint transaction
        await axios.post(`${API_URL}/mint/save`, mintData);

        // Update status to confirmed
        await axios.put(`${API_URL}/mint/status`, {
          txHash: tx.hash,
          status: "confirmed",
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed?.toString(),
        });

        setSuccess("Tokens minted successfully and recorded!");
      } catch (dbErr) {
        console.error("Error saving to database:", dbErr);
        setSuccess("Tokens minted successfully but database save failed");
      }

      setMintAmount("");
      setMintAddress("");

      if (storedAddress) {
        await loadContractData(storedAddress);
      }
    } catch (err: any) {
      console.error(err);
      setError("Error minting tokens: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          SimpleMint Token
        </h1>

        {!connected || !storedAddress ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="mb-6 space-y-3">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Connected Account</p>
                <p className="font-mono text-sm truncate">{storedAddress}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Your Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {balance} SMT
                </p>
              </div>

              {isOwner && (
                <div className="bg-green-100 border border-green-400 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">
                    You are the owner
                  </p>
                </div>
              )}
            </div>

            {isOwner ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount (SMT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleMint}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200"
                >
                  {loading ? "Minting..." : "Mint Tokens"}
                </button>
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg text-center">
                <p className="text-sm text-yellow-800">
                  Only the contract owner can mint tokens
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
