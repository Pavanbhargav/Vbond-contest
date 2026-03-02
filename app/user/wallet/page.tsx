"use client";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { IoWalletOutline, IoArrowUpCircle, IoArrowDownCircle, IoAdd, IoSwapHorizontal, IoClose } from "react-icons/io5";
import { databases, DB_ID, COL_USERS, COL_TRANSACTIONS } from "../../appwrite/appwrite";
import { Query, ID } from "appwrite";

interface Transaction {
    $id: string;
    transaction_amount: number;
    transaction_created: string;
    transaction_type?: string; 
    transaction_description?: string;
}

export default function Wallet() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [upi, setUpi] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [userDocId, setUserDocId] = useState("");
    
    // Modal states
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Withdraw form states
    const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
    const [withdrawUpi, setWithdrawUpi] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // 1. Fetch User Balance & UPI
                const userDocs = await databases.listDocuments(DB_ID, COL_USERS, [
                    Query.equal("userId", user.$id),
                    Query.limit(1)
                ]);

                if (userDocs.total > 0) {
                    const userData = userDocs.documents[0];
                    setBalance(userData.balance || 0);
                    setUpi(userData.upi_id || "");
                    setWithdrawUpi(userData.upi_id || ""); // Pre-fill withdraw modal UPI
                    setUserDocId(userData.$id);
                }

                // 2. Fetch Transactions
                const transDocs = await databases.listDocuments(DB_ID, COL_TRANSACTIONS, [
                    Query.equal("userId", user.$id),
                    Query.orderDesc("transaction_created"),
                    Query.limit(50) // Fetch top 50 transactions to allow local pagination
                ]);
                
                setTransactions(transDocs.documents.map(doc => ({
                    $id: doc.$id,
                    transaction_amount: doc.transaction_amount,
                    transaction_created: doc.transaction_created,
                    transaction_type: doc.transaction_type,
                    transaction_description: doc.transaction_description,
                })));

            } catch (error) {
                console.error("Error fetching wallet data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleWithdrawClick = () => {
        setWithdrawAmount("");
        setError("");
        setShowWithdrawModal(true);
    };

    const submitWithdraw = async () => {
        if (!user) return;
        
        const amount = Number(withdrawAmount);
        
        if (!amount || amount <= 0) {
            setError("Please enter a valid amount.");
            return;
        }
        
        if (amount > balance) {
            setError("Insufficient balance.");
            return;
        }
        
        if (!withdrawUpi.trim()) {
            setError("Please provide a valid UPI ID.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // Create Transaction Record
            const newDoc = await databases.createDocument(
                DB_ID,
                COL_TRANSACTIONS,
                ID.unique(),
                {
                    userId: user.$id,
                    transaction_amount: amount,
                    transaction_type: "debit",
                    transaction_description: "user request amount",
                    transaction_created: new Date().toISOString()
                }
            );

            // Update local state for immediate feedback
            const newTransaction: Transaction = {
                $id: newDoc.$id,
                transaction_amount: newDoc.transaction_amount,
                transaction_type: newDoc.transaction_type,
                transaction_description: newDoc.transaction_description,
                transaction_created: newDoc.transaction_created
            };
            
            const newBalance = balance - amount;
            setTransactions(prev => [newTransaction, ...prev]);
            setBalance(newBalance);
            
            // Close withdraw modal and show success
            setShowWithdrawModal(false);
            setShowSuccessModal(true);
            
            // If the user changed their UPI, update the users table
            if (userDocId) {
                try {
                    const updateData: any = { balance: newBalance };
                    if (withdrawUpi !== upi) {
                         updateData.upi_id = withdrawUpi;
                    }
                    
                    await databases.updateDocument(DB_ID, COL_USERS, userDocId, updateData);
                    
                    if (withdrawUpi !== upi) {
                         setUpi(withdrawUpi);
                    }
                } catch (updateError) {
                    console.error("Error updating user document:", updateError);
                }
            }

        } catch (err: any) {
            console.error("Error submitting withdrawal:", err);
            setError("Failed to process withdrawal. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate Pagination
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (!user || loading) return <div className="p-8"><div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"></div></div>;

    return (
        <div className="flex flex-col gap-8">
            <div>
                 <h1 className="text-3xl font-bold text-[var(--primary1)]">My Wallet</h1>
                 <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your earnings and payouts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card - Widened to cover full space */}
                <div className="lg:col-span-3 bg-gradient-to-r from-[var(--primary1)] to-orange-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                    <div className="relative z-10">
                        <p className="text-white/80 text-lg mb-1 font-medium">Total Balance</p>
                        <h2 className="text-5xl font-bold mb-6 tracking-tight">₹{balance.toFixed(2)}</h2>
                        <div className="flex flex-wrap gap-4">
                            <button 
                                onClick={handleWithdrawClick}
                                className="flex items-center gap-2 bg-white text-[var(--primary1)] px-5 py-2.5 rounded-lg hover:bg-zinc-100 transition font-bold shadow-md"
                            >
                                <IoArrowDownCircle className="text-xl" /> Withdraw
                            </button>
                        </div>
                    </div>
                    <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
                         <div className="flex items-center gap-2 text-sm text-white/90">
                            <IoWalletOutline />
                            <span>Linked UPI: {upi || "Not Linked"}</span>
                         </div>
                    </div>
                    <IoWalletOutline className="absolute -right-8 -bottom-12 text-[14rem] opacity-20 rotate-12" />
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Recent Activity</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {paginatedTransactions.length > 0 ? (
                        paginatedTransactions.map((item) => (
                            <div key={item.$id} className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${item.transaction_type === 'debit' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        {item.transaction_type === 'debit' ? <IoArrowUpCircle size={24} /> : <IoArrowDownCircle size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-800 dark:text-zinc-200 capitalize">
                                            {item.transaction_description || "Payout / Transaction"}
                                        </h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {new Date(item.transaction_created).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold text-lg ${item.transaction_type === 'debit' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {item.transaction_type === 'debit' ? '-' : '+'}₹{item.transaction_amount.toFixed(2)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                            No recent activity found.
                        </div>
                    )}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                        <button 
                            onClick={() => setShowWithdrawModal(false)}
                            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                        >
                            <IoClose size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-100">Withdraw Funds</h2>
                        
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl mb-6 border border-orange-100 dark:border-orange-500/20">
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-1">Available Balance</p>
                            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">₹{balance.toFixed(2)}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Amount to Withdraw (₹)
                                </label>
                                <input 
                                    type="number" 
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value ? Number(e.target.value) : "")}
                                    placeholder="Enter amount"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition"
                                    max={balance}
                                />
                                {withdrawAmount !== "" && Number(withdrawAmount) > 0 && (
                                    <p className="text-sm mt-2 font-medium flex justify-between">
                                        <span className="text-zinc-500">Remaining Balance:</span>
                                        <span className={balance - Number(withdrawAmount) < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}>
                                            ₹{(balance - Number(withdrawAmount)).toFixed(2)}
                                        </span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    UPI ID
                                </label>
                                <input 
                                    type="text" 
                                    value={withdrawUpi}
                                    onChange={(e) => setWithdrawUpi(e.target.value)}
                                    placeholder="Enter UPI ID"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-[var(--primary1)] focus:border-transparent outline-none transition"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <button 
                                    onClick={submitWithdraw}
                                    disabled={isSubmitting || typeof withdrawAmount === 'string' || withdrawAmount <= 0 || withdrawAmount > balance}
                                    className="w-full bg-[var(--primary1)] hover:bg-[var(--primary2)] disabled:bg-zinc-300 disabled:text-zinc-500 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Confirm Withdrawal"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IoArrowDownCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">Withdrawal Requested</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            Your request has been successfully placed. The money will be dispatched in 2-3 business days.
                        </p>
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold py-3 rounded-xl transition"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}