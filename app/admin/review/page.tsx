"use client";

import { useState } from "react";
import { IoCheckmarkCircle, IoCloseCircle, IoSearch, IoRefresh } from "react-icons/io5";

export default function Review() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Static Mock Data
  const [submissions, setSubmissions] = useState([
    { $id: "SUB-001", title: "Eco-Friendly Housing", user_id: "USER-101", status: "pending", $createdAt: "2023-11-15T10:00:00.000Z" },
    { $id: "SUB-002", title: "Smart City Traffic AI", user_id: "USER-102", status: "approved", $createdAt: "2023-11-14T14:30:00.000Z" },
    { $id: "SUB-003", title: "Blockchain Voting System", user_id: "USER-103", status: "rejected", $createdAt: "2023-11-12T09:15:00.000Z" },
    { $id: "SUB-004", title: "Vertical Farming Bot", user_id: "USER-104", status: "pending", $createdAt: "2023-11-10T16:45:00.000Z" },
    { $id: "SUB-005", title: "Renewable Energy Grid", user_id: "USER-105", status: "pending", $createdAt: "2023-11-09T11:20:00.000Z" }
  ]);

  const handleStatusUpdate = (id: string, status: string) => {
      // Mock update
      setSubmissions(prev => prev.map(sub => sub.$id === id ? { ...sub, status: status } : sub));
      alert(`Submission ${id} marked as ${status}`);
  };

  const filteredSubmissions = submissions.filter(sub => 
      (sub.title && sub.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.$id && sub.$id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Review Submissions</h1>
        <div className="flex gap-2">
            <button 
                onClick={() => {}} 
                className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            >
                <IoRefresh size={20} />
            </button>
            <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
                type="text"
                placeholder="Search ID or Title..."
                className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] w-64 bg-white dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Title/ID</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">User ID</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredSubmissions.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No submissions found.</td>
                </tr>
            ) : (
                filteredSubmissions.map((sub) => (
                <tr key={sub.$id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200">{sub.title || "Untitled"}</div>
                        <div className="text-xs text-zinc-500 font-mono">{sub.$id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                        {sub.user_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                        {new Date(sub.$createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        sub.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30"
                            : sub.status === "approved"
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                        }`}
                    >
                        {sub.status || "Unknown"}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleStatusUpdate(sub.$id, 'approved')}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors disabled:opacity-50"
                            disabled={sub.status === 'approved'}
                            title="Approve"
                        >
                        <IoCheckmarkCircle className="text-2xl" />
                        </button>
                        <button 
                            onClick={() => handleStatusUpdate(sub.$id, 'rejected')}
                            className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                            disabled={sub.status === 'rejected'}
                            title="Reject"
                        >
                        <IoCloseCircle className="text-2xl" />
                        </button>
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}