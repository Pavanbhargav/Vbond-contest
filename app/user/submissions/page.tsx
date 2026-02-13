"use client";

import { IoAdd, IoTimeOutline, IoCheckmarkDoneOutline, IoAlertCircleOutline } from "react-icons/io5";

export default function Submissions() {
    // Mock data
    const submissions = [
        { id: 1, title: "My awesome project", status: "Approved", date: "2023-10-20" },
        { id: 2, title: "Draft Submission", status: "Pending", date: "2023-10-22" },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-[var(--primary1)]">My Submissions</h1>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary2)] text-white rounded-lg hover:opacity-90 transition shadow-md font-medium">
                    <IoAdd className="text-xl" /> New Submission
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Empty State or Mapped Items */}
                 {submissions.map((sub) => (
                    <div key={sub.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${
                                sub.status === 'Approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                                sub.status === 'Pending' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {sub.status === 'Approved' ? <IoCheckmarkDoneOutline size={24}/> : 
                                 sub.status === 'Pending' ? <IoTimeOutline size={24}/> : <IoAlertCircleOutline size={24}/>}
                            </div>
                             <span className="text-xs text-gray-400 dark:text-gray-500">{sub.date}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{sub.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click to view details and feedback.</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${sub.status === 'Approved' ? 'bg-green-500 w-full' : 'bg-yellow-400 w-1/3'}`}></div>
                        </div>
                    </div>
                 ))}
                 
                 {/* Add New Card Placeholder */}
                 <button className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-[var(--primary1)] hover:text-[var(--primary1)] transition-colors min-h-[200px]">
                    <IoAdd size={48} className="mb-2 opacity-50" />
                    <span className="font-medium">Create New Submission</span>
                 </button>
            </div>
        </div>
    );
}