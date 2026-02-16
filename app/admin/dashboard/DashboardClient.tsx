"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  databases,
  DB_ID,
  COL_TASKS,
  COL_USERS,
  COL_SUBMISSIONS,
} from "../../appwrite/appwrite";
import { Query } from "appwrite";
import { 
  IoPeople, 
  IoDocumentText, 
  IoTime, 
  IoCheckmarkCircle, 
  IoRepeat,
  IoShieldCheckmark,
  IoPersonAdd,
  IoPersonRemove
} from "react-icons/io5";

interface Task {
  $id: string;
  title: string;
  status: string;
  $createdAt: string;
}

interface UserProfile {
  $id: string; // Document ID
  userId: string; // Auth User ID
  name: string;
  email: string;
  isAdmin?: boolean;
}

export default function DashboardClient() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    submissions: 0,
    pending: 0,
    tasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Stats & Recent Tasks in parallel
      const [tasksRes, usersRes, submissionsRes, pendingRes] = await Promise.all([
        databases.listDocuments(DB_ID, COL_TASKS, [
            Query.orderDesc("$createdAt"),
            Query.limit(5)
        ]),
        databases.listDocuments(DB_ID, COL_USERS, [
            Query.limit(50), // Increased from 20 to see more users
            Query.orderDesc("$createdAt")
        ]),
        databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
            Query.limit(1)
        ]),
        databases.listDocuments(DB_ID, COL_SUBMISSIONS, [
            Query.equal("status", "pending"),
            Query.limit(1)
        ]),
      ]);

      setStats({
        users: usersRes.total,
        tasks: tasksRes.total,
        submissions: submissionsRes.total,
        pending: pendingRes.total,
      });

      setRecentTasks(tasksRes.documents.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        status: doc.status,
        $createdAt: doc.$createdAt,
      })));

      setUsers(usersRes.documents.map((doc: any) => ({
        $id: doc.$id,
        userId: doc.userId,
        name: doc.name,
        email: doc.email,
        isAdmin: doc.isAdmin || false,
      })));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userDocId: string, currentStatus: boolean, name: string) => {
    const action = currentStatus ? "remove admin rights from" : "make admin";
    if (!confirm(`Are you sure you want to ${action} ${name}?`)) return;

    try {
        await databases.updateDocument(DB_ID, COL_USERS, userDocId, {
            isAdmin: !currentStatus
        });
        
        // Optimistic UI update
        setUsers(prev => prev.map(u => 
            u.$id === userDocId ? { ...u, isAdmin: !currentStatus } : u
        ));

        alert(`Successfully updated role for ${name}`);
    } catch (error: any) {
        console.error("Error updating role:", error);
        alert(`Failed to update user role: ${error.message}`);
    }
  };

  const statCards = [
    { label: "Total Users", value: stats.users, icon: IoPeople, color: "bg-blue-500" },
    { label: "Total Submissions", value: stats.submissions, icon: IoDocumentText, color: "bg-purple-500" },
    { label: "Pending Reviews", value: stats.pending, icon: IoTime, color: "bg-orange-500" },
    { label: "Active Tasks", value: stats.tasks, icon: IoCheckmarkCircle, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Dashboard</h1>
           <p className="text-zinc-500 dark:text-zinc-400">Overview of contest activity and user management</p>
        </div>
        <button 
            onClick={fetchDashboardData}
            className="self-start md:self-auto p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors"
            title="Refresh Data"
        >
            <IoRepeat className={`${loading ? "animate-spin" : ""}`} size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <h3 className="text-3xl font-bold mt-2 text-zinc-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-black/5`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Recent Tasks (1/3 width on large screens) */}
          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <IoDocumentText className="text-zinc-400" /> Recent Tasks
                  </h2>
                  <a href="/admin/tasks" className="text-xs font-semibold text-[var(--primary1)] hover:underline">View All</a>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loading ? (
                       [1,2,3].map(i => <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />)
                  ) : recentTasks.length === 0 ? (
                      <p className="text-center text-zinc-500 py-8">No tasks found</p>
                  ) : (
                      recentTasks.map(task => (
                          <div key={task.$id} className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{task.title}</h4>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      task.status === 'open' 
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                                  }`}>
                                      {task.status}
                                  </span>
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  Created: {new Date(task.$createdAt).toLocaleDateString()}
                              </p>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Right Column: User Management (2/3 width) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
               <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <IoPeople className="text-zinc-400" /> User Management
                  </h2>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left bg-white dark:bg-zinc-900">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                          <tr>
                              <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                              <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                              <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {loading ? (
                               <tr><td colSpan={3} className="p-8 text-center text-zinc-500 animate-pulse">Loading users...</td></tr>
                          ) : users.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-zinc-500">No users found</td></tr>
                          ) : users.map(u => (
                              <tr key={u.$id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                              {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                                          </div>
                                          <div>
                                              <div className="font-semibold text-zinc-900 dark:text-white">{u.name || "Unknown"}</div>
                                              <div className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      {u.isAdmin ? (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800">
                                              <IoShieldCheckmark /> Admin
                                          </span>
                                      ) : (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                                              User
                                          </span>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      {u.isAdmin ? (
                                          <button 
                                            onClick={() => toggleAdminRole(u.$id, true, u.name)}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-900/10 dark:hover:bg-red-900/30 dark:border-red-800 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                                            title="Downgrade to User"
                                          >
                                              <IoPersonRemove size={14} /> Remove Admin
                                          </button>
                                      ) : (
                                          <button 
                                            onClick={() => toggleAdminRole(u.$id, false, u.name)}
                                            className="text-xs font-medium text-[var(--primary1)] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/10 dark:hover:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                                            title="Promote to Admin"
                                          >
                                              <IoPersonAdd size={14} /> Make Admin
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
}
