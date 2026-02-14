"use client";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { IoWalletOutline, IoArrowUpCircle, IoArrowDownCircle, IoAdd, IoSwapHorizontal } from "react-icons/io5";

export default function Wallet() {
    const { user } = useAuth();
    
    // Static Mock Data
    const balance = 1250.00;
    const upi = "user@upi";

    if (!user) return <div className="p-8"><div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"></div></div>;

    return (
        <div className="flex flex-col gap-8">
            <div>
                 <h1 className="text-3xl font-bold text-[var(--primary1)]">My Wallet</h1>
                 <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your earnings and payouts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-2 bg-gradient-to-r from-[var(--primary1)] to-orange-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[240px]">
                    <div className="relative z-10">
                        <p className="text-white/80 text-lg mb-1 font-medium">Total Balance</p>
                        <h2 className="text-5xl font-bold mb-6 tracking-tight">${balance.toFixed(2)}</h2>
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 bg-white text-[var(--primary1)] px-5 py-2.5 rounded-lg hover:bg-zinc-100 transition font-bold shadow-md">
                                <IoArrowDownCircle className="text-xl" /> Withdraw
                            </button>
                             {/* <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2.5 rounded-lg hover:bg-white/30 transition font-medium">
                                <IoArrowUpCircle className="text-xl" /> Deposit
                            </button> */}
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

                {/* Quick Stats or Actions */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                        <h3 className="font-bold text-lg mb-4 text-[var(--foreground)]">Quick Actions</h3>
                        <div className="space-y-3">
                             <button className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition">
                                 <span className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-medium">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><IoSwapHorizontal /></div>
                                    Transaction History
                                 </span>
                                 <IoArrowUpCircle className="rotate-90 text-zinc-400" />
                             </button>
                             <button 
                                onClick={() => window.location.href='/user/dashboard'}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                             >
                                 <span className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300 font-medium">
                                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><IoWalletOutline /></div>
                                    Update Payment Details
                                 </span>
                                 <IoArrowUpCircle className="rotate-90 text-zinc-400" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity (Mock for now) */}
            <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Recent Activity</h3>
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-3 rounded-full">
                                    <IoArrowDownCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200">Prize Winnings</h4>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Oct 24, 2023</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">+$50.00</span>
                        </div>
                    ))}
                    <div className="p-4 text-center text-sm text-zinc-500">
                        Showing recent 3 transactions
                    </div>
                </div>
            </div>
        </div>
    );
}