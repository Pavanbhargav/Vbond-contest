"use client";

import { useState, useEffect } from "react";
import {
  IoDownloadOutline,
  IoSearch,
  IoArrowDown,
  IoArrowUp,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import * as XLSX from "xlsx";
import {
  databases,
  storage,
  client,
  DB_ID,
  COL_TRANSACTIONS,
  COL_USERS,
  BUCKET_ID,
} from "../../appwrite/appwrite";
import { Query, ID } from "appwrite";

interface UserData {
  $id: string;
  name: string;
  email: string;
  upi_id: string;
}

interface TransactionData {
  $id: string;
  userId: string;
  transaction_amount: number;
  transaction_type: string;
  transaction_created: string;
  transaction_status: string; // Removed optional '?' to ensure consistency
  transaction_file_id?: string;
  user?: UserData;
}

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let unsubscribe: () => void;

    try {
      const channel = `databases.${DB_ID}.collections.${COL_TRANSACTIONS}.documents`;
      
      unsubscribe = client.subscribe(channel, (response) => {
        const eventType = response.events[0];
        // Cast to our expected shape, but remember real-time docs don't have our mapped 'user'
        const updatedDoc = response.payload as Partial<TransactionData> & { $id: string };

        if (eventType.includes(".create")) {
          // Re-fetch to ensure we grab the new transaction AND map its user properly
          fetchTransactions();
        } else if (eventType.includes(".update")) {
          setTransactions((prev) =>
            prev.map((txn) =>
              txn.$id === updatedDoc.$id 
                ? { 
                    ...txn, 
                    ...updatedDoc, 
                    // Crucial: Preserve the mapped user object, otherwise it disappears on update
                    user: txn.user 
                  } as TransactionData
                : txn
            )
          );
        } else if (eventType.includes(".delete")) {
          setTransactions((prev) =>
            prev.filter((txn) => txn.$id !== updatedDoc.$id)
          );
        }
      });
    } catch (err) {
      console.error("Error in real-time subscription:", err);
    }

    fetchTransactions();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fixed: Appwrite strictly limits queries to 100. If you need more, you must implement cursor pagination.
      const usersRes = await databases.listDocuments(DB_ID, COL_USERS, [
        Query.limit(100), 
      ]);
      
      const usersMap: Record<string, UserData> = {};
      usersRes.documents.forEach((u) => {
        usersMap[u.userId] = {
          $id: u.userId,
          name: u.name || "Unknown",
          email: u.email || "",
          upi_id: u.upi_id || "",
        };
      });

      const transRes = await databases.listDocuments(DB_ID, COL_TRANSACTIONS, [
        Query.orderDesc("transaction_created"),
        Query.limit(100),
      ]);

      const mappedTransactions: TransactionData[] = transRes.documents.map(
        (doc) => {
          // Normalize the type to lowercase immediately so we don't have to check "Credit" vs "credit" in the UI
          const normalizedType = (doc.transaction_type || "").toLowerCase();
          
          return {
            $id: doc.$id,
            userId: doc.userId,
            transaction_amount: Number(doc.transaction_amount || 0), // Ensure it's always a valid number
            transaction_type: normalizedType,
            transaction_created: doc.transaction_created,
            transaction_status:
              doc.transaction_status ||
              (normalizedType === "debit" ? "Pending" : "Complete"),
            transaction_file_id: doc.transaction_file_id,
            user: usersMap[doc.userId],
          };
        }
      );

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (txnId: string, file: File | null) => {
    setUploadFiles((prev) => ({ ...prev, [txnId]: file }));
  };

  const markAsComplete = async (txn: TransactionData) => {
    try {
      setProcessingId(txn.$id);

      let fileId = txn.transaction_file_id;
      const fileToUpload = uploadFiles[txn.$id];

      if (fileToUpload) {
        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          fileToUpload
        );
        fileId = uploadedFile.$id;
      }

      await databases.updateDocument(DB_ID, COL_TRANSACTIONS, txn.$id, {
        transaction_status: "Complete",
        transaction_file_id: fileId,
      });

      // Local state update handled safely by real-time subscription, 
      // but doing it here guarantees immediate UI feedback
      setTransactions((prev) =>
        prev.map((t) =>
          t.$id === txn.$id
            ? { ...t, transaction_status: "Complete", transaction_file_id: fileId }
            : t
        )
      );

      setUploadFiles((prev) => {
        const newState = { ...prev };
        delete newState[txn.$id];
        return newState;
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction status.");
    } finally {
      setProcessingId(null);
    }
  };

  const markAsReverted = async (txn: TransactionData) => {
    try {
      if (
        !confirm(
          "Are you sure you want to revert this transaction to Pending? The uploaded receipt will be permanently deleted."
        )
      )
        return;

      setProcessingId(txn.$id);

      if (txn.transaction_file_id) {
        try {
          await storage.deleteFile(BUCKET_ID, txn.transaction_file_id);
        } catch (fileErr) {
          console.warn("Could not delete file from Appwrite, skipping.", fileErr);
        }
      }

      await databases.updateDocument(DB_ID, COL_TRANSACTIONS, txn.$id, {
        transaction_status: "Pending",
        transaction_file_id: null,
      });

      setTransactions((prev) =>
        prev.map((t) =>
          t.$id === txn.$id
            ? { ...t, transaction_status: "Pending", transaction_file_id: undefined }
            : t
        )
      );
    } catch (error) {
      console.error("Error reverting transaction:", error);
      alert("Failed to revert transaction status.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = () => {
    const exportData = filteredTransactions.map((txn) => ({
      "Transaction ID": txn.$id,
      "User Name": txn.user?.name || "Unknown",
      "User Email": txn.user?.email || "Unknown",
      "User UPI": txn.user?.upi_id || "Unknown",
      "Type": txn.transaction_type,
      "Amount (₹)": txn.transaction_amount,
      "Date": new Date(txn.transaction_created).toLocaleString(),
      "Status": txn.transaction_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "Transactions_Export.xlsx");
  };

  const filteredTransactions = transactions.filter((txn) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      txn.$id.toLowerCase().includes(searchLower) ||
      (txn.user?.name || "").toLowerCase().includes(searchLower) ||
      (txn.user?.email || "").toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Transactions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage and view all user transactions.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search User or ID..."
              className="pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] w-full md:w-64 bg-white dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary1)] text-white rounded-lg hover:bg-[var(--primary2)] transition-all duration-300 shadow-md hover:shadow-lg font-bold hover:-translate-y-0.5"
          >
            <IoDownloadOutline className="text-xl font-bold" /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <tr>
                <th className="px-6 py-5 font-bold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest">
                  Transaction ID
                </th>
                <th className="px-6 py-5 font-bold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest">
                  User Details
                </th>
                <th className="px-6 py-5 font-bold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest">
                  Type & Amount
                </th>
                <th className="px-6 py-5 font-bold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-5 font-bold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-5 font-bold text-right text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100/80 dark:divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-[var(--primary1)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="text-lg font-medium mb-1">
                      No transactions found
                    </div>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((txn) => (
                  <tr
                    key={txn.$id}
                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-all duration-300"
                  >
                    <td
                      className="px-6 py-4 text-zinc-400 dark:text-zinc-500 font-mono text-xs max-w-[120px] truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                      title={txn.$id}
                    >
                      {txn.$id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-zinc-800 dark:text-zinc-100 font-bold">
                          {txn.user?.name || "Unknown"}
                        </span>
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs">
                          {txn.user?.email || "No email"}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-mono mt-0.5">
                          UPI: {txn.user?.upi_id || "Not linked"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          {txn.transaction_type === "credit" ? (
                            <IoArrowUp className="text-green-500 bg-green-500/10 p-0.5 rounded-full" />
                          ) : (
                            <IoArrowDown className="text-red-500 bg-red-500/10 p-0.5 rounded-full" />
                          )}
                          <span className="text-zinc-700 dark:text-zinc-300 capitalize">
                            {txn.transaction_type}
                          </span>
                        </div>
                        <span
                          className={`font-black tracking-tight ${
                            txn.transaction_type === "credit"
                              ? "text-green-600 dark:text-green-400"
                              : "text-[var(--foreground)]"
                          }`}
                        >
                          {txn.transaction_type === "credit" ? "+" : "-"}₹
                          {txn.transaction_amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td
                      suppressHydrationWarning
                      className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-sm font-medium"
                    >
                      {new Date(txn.transaction_created).toLocaleDateString(
                        undefined,
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                          txn.transaction_status === "Complete"
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                            : txn.transaction_status === "Pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                        }`}
                      >
                        {txn.transaction_status}
                      </span>
                      {txn.transaction_file_id && (
                        <div className="mt-3">
                          <a
                            href={storage
                              .getFileView(BUCKET_ID, txn.transaction_file_id)
                              .toString()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow"
                          >
                            <IoDocumentTextOutline className="text-sm" /> View Receipt
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      {txn.transaction_status === "Pending" && (
                        <div className="flex flex-col gap-2 items-end justify-center">
                          <label className="relative cursor-pointer group/upload">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 group-hover/upload:border-[var(--primary1)] transition-colors">
                              <IoDocumentTextOutline className="text-zinc-400 group-hover/upload:text-[var(--primary1)]" />
                              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 group-hover/upload:text-[var(--primary1)] whitespace-nowrap">
                                {uploadFiles[txn.$id]
                                  ? uploadFiles[txn.$id]?.name.slice(0, 15) + "..."
                                  : "Choose File"}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) =>
                                handleFileChange(
                                  txn.$id,
                                  e.target.files ? e.target.files[0] : null
                                )
                              }
                              className="sr-only"
                            />
                          </label>

                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => markAsComplete(txn)}
                              disabled={
                                processingId === txn.$id ||
                                (!uploadFiles[txn.$id] && txn.transaction_type !== "credit")
                              }
                              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[11px] font-bold hover:bg-green-600 transition-all shadow-sm shadow-green-500/30 hover:shadow-md disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5"
                            >
                              {processingId === txn.$id ? (
                                "..."
                              ) : (
                                <>
                                  <IoCheckmarkCircleOutline className="text-sm" /> Complete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {txn.transaction_status === "Complete" && txn.transaction_file_id && (
                        <div className="flex justify-end mt-1">
                          <button
                            onClick={() => markAsReverted(txn)}
                            disabled={processingId === txn.$id}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-100 text-red-600 dark:bg-zinc-800/80 dark:text-red-400 rounded-lg text-[11px] font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 border border-transparent hover:border-red-200 dark:hover:border-red-900/30"
                          >
                            <IoCloseCircleOutline className="text-sm" /> Revert to Pending
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Showing{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                {filteredTransactions.length}
              </span>{" "}
              results
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}