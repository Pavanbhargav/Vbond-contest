"use client";
import { useAuth } from "../../context/AuthContext";
import { COL_USERS, databases, DB_ID } from "../../appwrite/appwrite";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [upi, setUpi] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const doc = await databases.getDocument(DB_ID, COL_USERS, user.$id);
          if (doc.upi_id) {
            setUpi(doc.upi_id);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const updateUpi = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await databases.updateDocument(DB_ID, COL_USERS, user.$id, {
        upi_id: upi,
      });
      alert("UPI ID Updated Successfully!");
    } catch (error: any) {
      console.error("Failed to update UPI:", error);
      alert("Update failed: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[var(--primary1)]">User Dashboard</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Profile Settings</h2>
        
        {!upi && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r dark:bg-red-900/20">
                <p className="text-red-700 dark:text-red-400">Please enter your UPI ID for future transactions.</p>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UPI ID</label>
            <input
              type="text"
              value={upi}
              placeholder="Enter UPI ID"
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onChange={(e) => setUpi(e.target.value)}
              required
            />
          </div>
          <button
            onClick={updateUpi}
            disabled={isSaving || !user}
            className="w-full sm:w-auto bg-[var(--primary1)] text-white px-6 py-3 rounded-lg hover:bg-[var(--primary2)] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
          >
            {isSaving ? "Saving..." : "Update UPI"}
          </button>
        </div>
      </div>
    </div>
  );
}