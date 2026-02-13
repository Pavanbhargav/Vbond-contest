"use client";

import { IoDownloadOutline, IoFilter } from "react-icons/io5";

export default function Transactions() {
  const transactions = [
    { id: "TXN001", user: "John Doe", amount: "$50.00", type: "Credit", date: "2023-10-25" },
    { id: "TXN002", user: "Jane Smith", amount: "$120.00", type: "Debit", date: "2023-10-24" },
    { id: "TXN003", user: "Alice Johnson", amount: "$75.00", type: "Credit", date: "2023-10-23" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--primary1)]">Transactions</h1>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition">
                <IoFilter /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary1)] text-white rounded-lg hover:bg-[var(--primary2)] transition shadow-md">
                <IoDownloadOutline className="text-xl" /> Export
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Transaction ID</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Type</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-6 py-4 font-semibold text-right text-gray-600 dark:text-gray-300">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{txn.id}</td>
                <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">{txn.user}</td>
                <td className="px-6 py-4">
                     <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      txn.type === "Credit"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{txn.date}</td>
                <td className={`px-6 py-4 text-right font-bold ${txn.type === 'Credit' ? 'text-green-600 dark:text-green-400': 'text-gray-800 dark:text-gray-200'}`}>
                    {txn.type === 'Credit' ? '+' : ''}{txn.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}