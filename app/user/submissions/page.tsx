"use client";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { IoAdd, IoTimeOutline, IoCheckmarkDoneOutline, IoAlertCircleOutline, IoCloudUploadOutline } from "react-icons/io5";

export default function Submissions() {
    const { user } = useAuth();
    
    // Static Mock Data
    const submissions = [
        { $id: "SUB-001", title: "Eco-Friendly Housing", description: "A sustainable housing project design.", status: "pending", $createdAt: "2023-11-15T10:00:00.000Z" },
        { $id: "SUB-002", title: "Smart City Traffic AI", description: "AI algorithm to manage traffic flow.", status: "approved", $createdAt: "2023-11-14T14:30:00.000Z" },
        { $id: "SUB-003", title: "Blockchain Voting System", description: "Secure voting implementation.", status: "rejected", $createdAt: "2023-11-12T09:15:00.000Z" },
    ];

    if (!user) return <div className="p-8"><div className="h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse"></div></div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)]">My Submissions</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Status of your submitted work</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {submissions.map((sub) => (
                    <div key={sub.$id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${
                                sub.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                                sub.status === 'pending' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {sub.status === 'approved' ? <IoCheckmarkDoneOutline size={24}/> : 
                                 sub.status === 'pending' ? <IoTimeOutline size={24}/> : <IoAlertCircleOutline size={24}/>}
                            </div>
                             <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{new Date(sub.$createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2 line-clamp-1">{sub.title || "Untitled Submission"}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                            {sub.description || "No description provided."}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                                sub.status === 'approved' ? 'text-green-600' : 
                                sub.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {sub.status}
                            </span>
                        </div>
                    </div>
                 ))}
                 
                 {/* Empty State Link */}
                 {submissions.length === 0 && (
                     <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                        <IoCloudUploadOutline size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">No submissions yet</p>
                        <p className="text-sm">Participate in a contest to see your work here.</p>
                     </div>
                 )}
            </div>
        </div>
    );
}