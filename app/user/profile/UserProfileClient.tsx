"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { databases, DB_ID, COL_USERS } from "../../appwrite/appwrite";
import { Query } from "appwrite";
import { IoPerson, IoCall, IoWallet, IoSave, IoAlertCircle } from "react-icons/io5";

export default function UserProfileClient() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    upi_id: ""
  });

  const [docId, setDocId] = useState<string | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (!user?.$id) return;

      const response = await databases.listDocuments(DB_ID, COL_USERS, [
        Query.equal("userId", user.$id),
        Query.limit(1)
      ]);

      if (response.documents.length > 0) {
        const doc = response.documents[0];
        setDocId(doc.$id);
        setFormData({
          name: doc.name || user.name || "",
          phone: doc.phone || user.phone || "", // Fallback to auth phone if available
          upi_id: doc.upi_id || ""
        });
      } else {
        // Handle case where user doc doesn't exist yet (should match signup logic)
        setFormData({
             name: user.name || "",
             phone: user.phone || "", 
             upi_id: ""
        });
      }

    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage({ type: 'error', text: "Failed to load profile data." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !docId) {
        setMessage({ type: 'error', text: "Profile not found or user not logged in." });
        return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await databases.updateDocument(DB_ID, COL_USERS, docId, {
        name: formData.name,
        phone: formData.phone,
        upi_id: formData.upi_id
      });
      setMessage({ type: 'success', text: "Profile updated successfully!" });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setMessage({ type: 'error', text: error.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Profile Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Manage your personal information and payment details.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
        
        {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900' 
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900'
            }`}>
                <IoAlertCircle size={20} />
                <span>{message.text}</span>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Full Name
                </label>
                <div className="relative">
                    <IoPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] transition-all dark:text-white"
                        placeholder="Your Name"
                    />
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    Phone Number
                </label>
                <div className="relative">
                    <IoCall className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] transition-all dark:text-white"
                        placeholder="Your Phone Number"
                    />
                </div>
            </div>

            {/* UPI ID */}
            <div>
                 <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    UPI ID <span className="text-xs text-zinc-500 font-normal ml-1">(For Payouts)</span>
                </label>
                <div className="relative">
                    <IoWallet className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        name="upi_id"
                        value={formData.upi_id}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary1)] transition-all dark:text-white"
                        placeholder="username@upi"
                    />
                </div>
                {!formData.upi_id && (
                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <IoAlertCircle /> Add your UPI ID to receive payments.
                    </p>
                )}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--primary1)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--primary1)]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>Saving...</>
                    ) : (
                        <>
                            <IoSave size={18} /> Save Changes
                        </>
                    )}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}
