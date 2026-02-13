"use client";

import { useState } from "react";
import { IoCheckmarkCircle, IoCloseCircle, IoSearch } from "react-icons/io5";

export default function Review() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for current visualization
  const reviews = [
    { id: 1, user: "John Doe", submission: "Project Alpha", status: "Pending", date: "2023-10-25" },
    { id: 2, user: "Jane Smith", submission: "Project Beta", status: "Reviewed", date: "2023-10-24" },
    { id: 3, user: "Alice Johnson", submission: "Project Gamma", status: "Rejected", date: "2023-10-23" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--primary1)]">Review Submissions</h1>
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search submissions..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Submission</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{review.user}</td>
                <td className="px-6 py-4 text-gray-800 dark:text-gray-200">{review.submission}</td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{review.date}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      review.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : review.status === "Reviewed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {review.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-green-600 hover:text-green-800 transition-colors">
                      <IoCheckmarkCircle className="text-2xl" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 transition-colors">
                      <IoCloseCircle className="text-2xl" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
            <div className="p-8 text-center text-gray-500">No submissions found.</div>
        )}
      </div>
    </div>
  );
}