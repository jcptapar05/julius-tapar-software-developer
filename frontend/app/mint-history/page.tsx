"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAddressStore } from '@/stores/address';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MintHistory() {
  const { address: storedAddress } = useAddressStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (storedAddress) {
      fetchMintHistory(currentPage);
    }
  }, [storedAddress, currentPage]);

  const fetchMintHistory = async (page: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/mint/history`, {
        params: {
          address: storedAddress,
          limit,
          page,
        },
      });

      setHistory(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching mint history:', err);
      setError(
        'Failed to fetch mint history: ' + (err.message || 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!storedAddress) {
    return (
      <div className="text-center text-gray-600">
        <p>Please connect your wallet to view mint history</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Mint History</h2>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading mint history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No mint transactions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      TX Hash
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      From
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      To
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Amount (SMT)
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((mint) => (
                    <tr
                      key={mint._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <a
                          href={`https://etherscan.io/tx/${mint.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono text-xs truncate max-w-[150px] block"
                          title={mint.txHash}
                        >
                          {formatAddress(mint.txHash)}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-mono text-xs"
                          title={mint.from}
                        >
                          {formatAddress(mint.from)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="font-mono text-xs"
                          title={mint.to}
                        >
                          {formatAddress(mint.to)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {mint.amount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            mint.status
                          )}`}
                        >
                          {mint.status.charAt(0).toUpperCase() +
                            mint.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(mint.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition"
              >
                Previous
              </button>

              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-400 hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}