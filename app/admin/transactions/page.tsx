"use client";

import { useState } from "react";
import { IoDownloadOutline, IoFilter, IoSearch, IoArrowDown, IoArrowUp } from "react-icons/io5";

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - Replace with real DB fetch later
  const transactions = [
    { id: "TXN001", user: "John Doe", amount: "$50.00", type: "Credit", date: "2023-10-25", status: "Success" },
    { id: "TXN002", user: "Jane Smith", amount: "$120.00", type: "Debit", date: "2023-10-24", status: "Pending" },
    { id: "TXN003", user: "Alice Johnson", amount: "$75.00", type: "Credit", date: "2023-10-23", status: "Success" },
    { id: "TXN004", user: "Bob Wilson", amount: "$25.00", type: "Debit", date: "2023-10-22", status: "Failed" },
  ];

  const filteredTransactions = transactions.filter(txn => 
    txn.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
    txn.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">Transactions</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Manage and view all user transactions.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
                <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search User or ID..."
                    className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] w-full md:w-64 bg-white dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {/* <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition bg-white dark:bg-zinc-900">
                <IoFilter /> Filter
            </button> */}
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary1)] text-white rounded-lg hover:bg-[var(--primary1)]/90 transition shadow-sm font-medium">
                <IoDownloadOutline className="text-xl" /> Export
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">User</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-right text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">{txn.id}</td>
                <td className="px-6 py-4 text-zinc-800 dark:text-zinc-200 font-medium">{txn.user}</td>
                <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        {txn.type === "Credit" ? <IoArrowUp className="text-green-500"/> : <IoArrowDown className="text-red-500"/>}
                        <span className="text-zinc-700 dark:text-zinc-300">{txn.type}</span>
                     </div>
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm">{txn.date}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        txn.status === 'Success' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                        txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30' :
                        'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                    }`}>
                        {txn.status}
                    </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold font-mono ${txn.type === 'Credit' ? 'text-green-600 dark:text-green-400': 'text-zinc-800 dark:text-zinc-200'}`}>
                    {txn.type === 'Credit' ? '+' : '-'}{txn.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
             <div className="p-8 text-center text-zinc-500">No transactions found.</div>
        )}
        </div>
      </div>
    </div>
  );
}