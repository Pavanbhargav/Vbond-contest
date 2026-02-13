"use client";

import { IoWalletOutline, IoArrowUpCircle, IoArrowDownCircle } from "react-icons/io5";

export default function Wallet() {
    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold text-[var(--primary2)]">My Wallet</h1>

            {/* Balance Card */}
            <div className="bg-gradient-to-r from-[var(--primary2)] to-blue-600 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-100 text-lg mb-1">Total Balance</p>
                    <h2 className="text-5xl font-bold mb-6">$1,250.00</h2>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition">
                            <IoArrowDownCircle className="text-xl" /> Withdraw
                        </button>
                         <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition">
                            <IoArrowUpCircle className="text-xl" /> Deposit
                        </button>
                    </div>
                </div>
                <IoWalletOutline className="absolute -right-6 -bottom-10 text-[12rem] opacity-20 rotate-12" />
            </div>

            {/* Recent Activity */}
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-3 rounded-full">
                                    <IoArrowDownCircle size={24} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">Prize Winnings</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Oct 24, 2023</p>
                                </div>
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-400 text-lg">+$50.00</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}