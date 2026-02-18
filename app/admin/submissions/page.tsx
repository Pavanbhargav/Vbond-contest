"use client";

import {
  client,
  COL_SUBMISSIONS,
  COL_TASKS,
  COL_USERS,
  databases,
  DB_ID,
} from "@/app/appwrite/appwrite";
import { useAuth } from "@/app/context/AuthContext";
import { Query } from "appwrite";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronForward,
  IoCloseCircle,
  IoFilter,
  IoSearch,
  IoTime,
} from "react-icons/io5";

export interface Submission {
  $id: string;
  taskId: string;
  userId: string;
  fileId: string;
  status: "pending" | "approved" | "rejected";
  $createdAt: string;
  $updatedAt: string;
  taskTitle?: string;
  taskType?: string;
  username?: string;
}

export default function AdminSubmissionsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      // Build Queries
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(itemsPerPage),
        Query.offset((currentPage - 1) * itemsPerPage),
      ];

      // Note: Appwrite filtering on related collections (like task title) via listDocuments isn't directly possible 
      // without complex setup or denormalization. 
      // For this implementation, we interpret "search" as filtering AFTER fetching page, 
      // OR we would need to filter by ID if we had the IDs.
      // However, typical server-side pagination implies we fetch a page of results.
      // If we implement client-side search on top of server-pagination, it only searches the current page, which is confusing.
      // 
      // TRUE server-side search needs Appwrite Text Indexes on supported fields.
      // Since we don't have indexes on "taskTitle" (it's not on submission), we can't search it server-side easily here.
      // 
      // Compromise for now: 
      // 1. Fetch page. 
      // 2. Resolve relations. 
      // 3. (Client-side search helps only if we fetch ALL, but we are paginating).
      // 
      // Allow me to implement simpler pagination first. 
      // If the user wants robust search over ALL submissions, we'd need to fetch ALL (sans limit/offset initially) 
      // or implement Full Text Logic on Appwrite functions.
      // given the constraints, I will implement pagination on the *submissions collection*.

      // 1. Fetch Submissions Page
      const submissionsResponse = await databases.listDocuments(
        DB_ID,
        COL_SUBMISSIONS,
        queries
      );

      setTotalItems(submissionsResponse.total);

      // 2. Fetch Tasks AND Users for Lookups (Only for the fetched submissions)
      // Optimization: Fetch only distinct taskIds and userIds from the page results
      const distinctTaskIds = [...new Set(submissionsResponse.documents.map(d => d.taskId))];
      const distinctUserIds = [...new Set(submissionsResponse.documents.map(d => d.userId))];

      // We can't do "WHERE $id IN [...]" easily with standard Appwrite queries in one go without a loop or big OR query.
      // For simplicity/performance balance on small pages, we can just fetch details or leverage caching if we had it.
      // Let's blindly fetch all active tasks/users for now as in previous step, OR fetch individually if list is small.
      // Since itemsPerPage is 10, fetching 10 tasks/users is fine.

      const taskPromises = distinctTaskIds.map(id => databases.getDocument(DB_ID, COL_TASKS, id).catch(() => null));
      const userPromises = distinctUserIds.map(id => databases.listDocuments(DB_ID, COL_USERS, [Query.equal("userId", id)]).catch(() => null));

      const [tasksRes, usersRes] = await Promise.all([
        Promise.all(taskPromises),
        Promise.all(userPromises)
      ]);

      const taskMap = new Map();
      tasksRes.forEach(t => { 
          if(t) taskMap.set(t.$id, { title: t.title, type: t.task_type });
      });

      const userMap = new Map();
      usersRes.forEach(u => {
          if(u && u.documents.length > 0) userMap.set(u.documents[0].userId, u.documents[0].name);
      });

      const mappedSubmissions = submissionsResponse.documents.map((doc) => ({
        $id: doc.$id,
        taskId: doc.taskId,
        userId: doc.userId,
        fileId: doc.fileId,
        status: doc.status,
        $createdAt: doc.$createdAt,
        $updatedAt: doc.$updatedAt,
        taskTitle: taskMap.get(doc.taskId)?.title || "Unknown Task",
        taskType: taskMap.get(doc.taskId)?.type || "Unknown",
        username: userMap.get(doc.userId) || "Unknown User",
      })) as Submission[];

      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchSubmissions();
    }
  }, [authLoading, isAdmin, currentPage, itemsPerPage]); // Fetch when page changes

  // Filter Logic (Applied Client-Side to the CURRENT PAGE)
  // note: deeply filtering paginated data client-side is weird (you might map an empty page).
  // Ideally, filterType should be a database Query.
  // Let's adding Filter by Status/Type to database queries if possible?
  // Type is on Task, not Submission, so we can't fileter by Type on DB without Appwrite Functions or relationships.
  // We'll keep client-side filtering for now, but acknowledge it only filters the *fetched page*.
  
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "All" || sub.taskType === filterType;

    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500";
      default:
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500";
    }
  };

  const getTypeColor = (type: string) => {
     switch (type) {
        case 'Video': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        case 'Photo': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'UI': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400';
        default: return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400';
     }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  if (authLoading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary1)]" /></div>;
  if (!isAdmin) return <div className="p-10 text-center text-red-500">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            User Submissions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Review and manage all task submissions
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search in current page..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-[var(--primary1)] text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
            <IoFilter className="text-zinc-400" />
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl py-2 pl-3 pr-8 focus:ring-2 focus:ring-[var(--primary1)] text-zinc-900 dark:text-white"
            >
                <option value="All">All Types</option>
                <option value="Video">Video</option>
                <option value="Photo">Photo</option>
                <option value="UI">UI Design</option>
                <option value="GraphicDesign">Graphic Design</option>
                <option value="VectorDesign">Vector Design</option>
            </select>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Task Title
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Updated At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36"></div></td>
                  </tr>
                ))
              ) : filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((sub) => (
                  <motion.tr
                    key={sub.$id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => router.push(`/admin/tasks/${sub.taskId}/review`)}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-900 dark:text-white group-hover:text-[var(--primary1)] transition-colors">
                        {sub.taskTitle}
                      </div>
                    </td>
                     <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(sub.taskType || '')}`}>
                        {sub.taskType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-zinc-600 dark:text-zinc-400 font-medium">
                        {sub.username}
                      </div>
                      <div className="text-xs text-zinc-400">ID: {sub.userId.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          sub.status
                        )} border-transparent`}
                      >
                         {sub.status === 'approved' && <IoCheckmarkCircle size={14}/>}
                         {sub.status === 'rejected' && <IoCloseCircle size={14}/>}
                         {sub.status === 'pending' && <IoTime size={14}/>}
                        {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 text-sm">
                      {new Date(sub.$updatedAt || sub.$createdAt).toLocaleDateString()}
                      <span className="text-zinc-400 text-xs ml-2">
                         {new Date(sub.$updatedAt || sub.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                    No submissions found on this page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4 bg-zinc-50 dark:bg-zinc-800/30 flex items-center justify-between">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span className="font-semibold text-zinc-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="font-semibold text-zinc-900 dark:text-white">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || loading}
                    className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-600 dark:text-zinc-300"
                >
                    <IoChevronBack size={18} />
                </button>
                
                <span className="px-4 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium">
                    Page {currentPage} of {totalPages || 1}
                </span>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-zinc-600 dark:text-zinc-300"
                >
                    <IoChevronForward size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}