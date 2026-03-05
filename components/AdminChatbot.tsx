"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../app/context/AuthContext";
import { databases, client, DB_ID, COL_ROOMS, COL_MESSAGES, COL_USERS } from "../app/appwrite/appwrite";
import { Query, ID, Models } from "appwrite";
import { IoChatbubbleEllipses, IoClose, IoSend, IoPerson } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

interface RoomDocument extends Models.Document {
    user_id: string;
    status: "open" | "closed" | "assigned";
    last_message_at: string;
    assigned_admin_id?: string;
}

interface MessageDocument extends Models.Document {
    room_id: string;
    sender_id: string;
    message_text: string;
}

interface UserDocument extends Models.Document {
    userId: string;
    name: string;
    email: string;
    phone: string;
    balance: number;
}

export default function AdminChatbot() {
    const { user, isAdmin } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [rooms, setRooms] = useState<(RoomDocument & { userDetails?: UserDocument })[]>([]);
    const [activeRoom, setActiveRoom] = useState<RoomDocument | null>(null);
    const [messages, setMessages] = useState<MessageDocument[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeRoom]);

    useEffect(() => {
        if (!isAdmin || !user) return;

        const fetchUserDetails = async (roomData: RoomDocument) => {
            try {
                const userRes = await databases.listDocuments(DB_ID, COL_USERS, [
                    Query.equal("userId", roomData.user_id)
                ]);
                if (userRes.documents.length > 0) {
                    return { ...roomData, userDetails: userRes.documents[0] as unknown as UserDocument };
                }
            } catch (e) {
                console.error("Could not fetch user details for room", e);
            }
            return roomData;
        };

        const fetchRooms = async () => {
            try {
                const res = await databases.listDocuments(DB_ID, COL_ROOMS, [
                    Query.notEqual("status", "closed"),
                    Query.orderDesc("last_message_at")
                ]);
                
                const roomsWithUsers = await Promise.all(
                    res.documents.map(r => fetchUserDetails(r as unknown as RoomDocument))
                );
                
                setRooms(roomsWithUsers);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            }
        };

        fetchRooms();

        const unsubscribe = client.subscribe(
            [`databases.${DB_ID}.collections.${COL_ROOMS}.documents`],
            (response) => {
                const updatedRoom = response.payload as unknown as RoomDocument;
                setRooms(prevRooms => {
                    const exists = prevRooms.find(r => r.$id === updatedRoom.$id);
                    if (exists) {
                        return prevRooms.map(r => r.$id === updatedRoom.$id ? { ...updatedRoom, userDetails: r.userDetails } : r);
                    } else {
                        // New room, fetch user details
                        fetchUserDetails(updatedRoom).then(r => {
                            setRooms(current => [r, ...current]);
                        });
                        return prevRooms;
                    }
                });
            }
        );

        return () => unsubscribe();
    }, [isAdmin, user]);

    // Subscribe to messages if in an active room
    useEffect(() => {
        if (!activeRoom || !isAdmin) return;

        const unsubscribe = client.subscribe(
            [`databases.${DB_ID}.collections.${COL_MESSAGES}.documents`],
            (response) => {
                if (
                    response.events.includes("databases.*.collections.*.documents.*.create") &&
                    (response.payload as unknown as MessageDocument).room_id === activeRoom.$id
                ) {
                    setMessages(prev => [...prev, response.payload as unknown as MessageDocument]);
                }
            }
        );

        return () => unsubscribe();
    }, [activeRoom, isAdmin]);

    const fetchMessages = async (roomId: string) => {
        try {
            const res = await databases.listDocuments(DB_ID, COL_MESSAGES, [
                Query.equal("room_id", roomId),
                Query.orderAsc("$createdAt")
            ]);
            setMessages(res.documents as unknown as MessageDocument[]);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleJoinRoom = async (roomData: RoomDocument) => {
        setErrorMsg("");
        
        // If room is already occupied by someone else
        if (roomData.status === "assigned" && roomData.assigned_admin_id !== user?.$id) {
            setErrorMsg("This room is already occupied by another admin.");
            setErrorMsg("This room is already assigned to another admin.");
            setTimeout(() => setErrorMsg(""), 3000);
            return;
        }

        setLoading(true);
        try {
            // Update room to assigned if it's open
            let updatedRoom = roomData;
            if (roomData.status === "open") {
                const doc = await databases.updateDocument(DB_ID, COL_ROOMS, roomData.$id, {
                    status: "assigned",
                    assigned_admin_id: user?.$id
                });
                updatedRoom = doc as unknown as RoomDocument;
            }
            
            setActiveRoom(updatedRoom);
            await fetchMessages(updatedRoom.$id);
        } catch (error) {
            console.error("Error joining room:", error);
            setErrorMsg("Failed to join room.");
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRoom || !user) return;

        const msgText = newMessage.trim();
        setNewMessage("");

        try {
            await databases.createDocument(DB_ID, COL_MESSAGES, ID.unique(), {
                room_id: activeRoom.$id,
                sender_id: user.$id,
                message_text: msgText
            });

            await databases.updateDocument(DB_ID, COL_ROOMS, activeRoom.$id, {
                last_message_at: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const closeRoom = async (roomId: string) => {
        if (!window.confirm("Are you sure you want to close this chat?")) return;
        setLoading(true);
        try {
            await databases.updateDocument(DB_ID, COL_ROOMS, roomId, {
                status: "closed"
            });
            setActiveRoom(null);
            setMessages([]);
        } catch (error) {
            console.error("Error closing room:", error);
            setErrorMsg("Failed to close room.");
            setTimeout(() => setErrorMsg(""), 3000);
        } finally {
            setLoading(false);
        }
    };

    const leaveRoom = () => {
        setActiveRoom(null);
        setMessages([]);
    };

    if (!isAdmin || !user) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-80 md:w-96 mb-4 flex flex-col overflow-hidden"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className="bg-zinc-900 dark:bg-black p-4 flex justify-between items-center text-white border-b border-zinc-800">
                            <div>
                                <h3 className="font-bold flex items-center gap-2">
                                    <IoChatbubbleEllipses /> 
                                    {activeRoom ? "Chatting with User" : "Support Dashboard"}
                                </h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition">
                                <IoClose size={24} />
                            </button>
                        </div>

                        {/* Error Message layer */}
                        {errorMsg && (
                            <div className="bg-red-500 text-white text-xs text-center p-2 font-semibold">
                                {errorMsg}
                            </div>
                        )}

                        {/* Body - Room List or Active Chat */}
                        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 flex flex-col relative">
                            {!activeRoom ? (
                                <div className="p-2 space-y-2">
                                    <h4 className="px-2 pt-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Requests</h4>
                                    {rooms.length === 0 ? (
                                        <p className="text-center text-sm text-zinc-500 mt-10">No active chat requests.</p>
                                    ) : (
                                        rooms.map(r => (
                                            <div key={r.$id} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-xl flex items-center justify-between hover:border-primary1 transition-colors group cursor-pointer" onClick={() => handleJoinRoom(r)}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`p-2 rounded-full ${r.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                        <IoPerson size={16} />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-semibold dark:text-white truncate">
                                                            {r.userDetails?.name || 'Unknown User'}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                            {r.userDetails?.email || r.user_id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${r.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-600'}`}>
                                                        {r.status === 'open' ? 'open' : 'assigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
                                    <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 flex items-center justify-between shadow-sm z-10">
                                        <button onClick={leaveRoom} className="text-xs font-semibold text-zinc-600 hover:text-black dark:text-zinc-300 dark:hover:text-white flex items-center gap-1">
                                            <span>&larr;</span> Back to list
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ASSIGNED TO YOU</span>
                                            <button onClick={() => closeRoom(activeRoom.$id)} className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold hover:bg-red-200 transition-colors uppercase cursor-pointer">Close Chat</button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
                                        {messages.map((msg, i) => {
                                            const isMe = msg.sender_id === user.$id;
                                            return (
                                                <div key={i} className={`max-w-[85%] px-3 py-2 rounded-2xl ${isMe ? 'bg-zinc-900 dark:bg-white text-white dark:text-black self-end rounded-br-none' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 self-start rounded-bl-none'}`}>
                                                    <p className="text-sm">{msg.message_text}</p>
                                                    <span className="text-[10px] opacity-50 mt-1 block">
                                                        {new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    
                                    <form onSubmit={sendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:outline-none dark:text-white text-sm"
                                            disabled={loading}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || loading}
                                            className="p-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                        >
                                            <IoSend size={18} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-2xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition relative"
                >
                    <IoChatbubbleEllipses size={28} />
                    {rooms.some(r => r.status === 'open') && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse"></span>
                    )}
                </motion.button>
            )}
        </div>
    );
}
