"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../app/context/AuthContext";
import { databases, client, DB_ID, COL_ROOMS, COL_MESSAGES } from "../app/appwrite/appwrite";
import { Query, ID, Models } from "appwrite";
import { IoChatbubbleEllipses, IoClose, IoSend } from "react-icons/io5";
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

export default function UserChatbot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<MessageDocument[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [room, setRoom] = useState<RoomDocument | null>(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Check if user already has a room, and subscribe to messages if so
    useEffect(() => {
        if (!user || user.labels?.includes("admin")) return;

        const checkExistingRoom = async () => {
            try {
                const response = await databases.listDocuments(DB_ID, COL_ROOMS, [
                    Query.equal("user_id", user.$id)
                ]);
                const activeRoom = response.documents.find(doc => doc.status !== "closed");
                if (activeRoom) {
                    setRoom(activeRoom as unknown as RoomDocument);
                    fetchMessages(activeRoom.$id);
                }
            } catch (error) {
                console.error("Error fetching room:", error);
            }
        };

        checkExistingRoom();
    }, [user]);

    // Setup Realtime subscription when room exists
    useEffect(() => {
        if (!room) return;

        const unsubscribeMessages = client.subscribe(
            [`databases.${DB_ID}.collections.${COL_MESSAGES}.documents`],
            (response) => {
                if (
                    response.events.includes("databases.*.collections.*.documents.*.create") &&
                    (response.payload as unknown as MessageDocument).room_id === room.$id
                ) {
                    setMessages(prev => [...prev, response.payload as unknown as MessageDocument]);
                }
            }
        );

        const unsubscribeRoom = client.subscribe(
            [`databases.${DB_ID}.collections.${COL_ROOMS}.documents.${room.$id}`],
            (response) => {
                if (response.events.includes("databases.*.collections.*.documents.*.update")) {
                    const updatedRoom = response.payload as unknown as RoomDocument;
                    if (updatedRoom.status === 'closed') {
                        setRoom(updatedRoom);
                    } else {
                        setRoom(updatedRoom);
                    }
                }
            }
        );

        return () => {
            unsubscribeMessages();
            unsubscribeRoom();
        };
    }, [room]);

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

    const handleConnectClick = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let activeRoom = room;

            // Create room if it doesn't exist
            if (!activeRoom) {
                const doc = await databases.createDocument(DB_ID, COL_ROOMS, ID.unique(), {
                    user_id: user.$id,
                    status: "open",
                    last_message_at: new Date().toISOString()
                });
                activeRoom = doc as unknown as RoomDocument;
                setRoom(activeRoom);
            }

            // Send Email to Admins
            await fetch("/api/notify-admin-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail: user.email, userName: user.name })
            });

            // Create an initial system message to start the room
            await databases.createDocument(DB_ID, COL_MESSAGES, ID.unique(), {
                room_id: activeRoom.$id,
                sender_id: user.$id,
                message_text: "Hello! I need some assistance."
            });

            // Update room last updated time
             await databases.updateDocument(DB_ID, COL_ROOMS, activeRoom.$id, {
                last_message_at: new Date().toISOString()
            });

        } catch (error) {
            console.error("Error connecting to chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !room || !user) return;

        const msgText = newMessage.trim();
        setNewMessage("");

        try {
            await databases.createDocument(DB_ID, COL_MESSAGES, ID.unique(), {
                room_id: room.$id,
                sender_id: user.$id,
                message_text: msgText
            });

            await databases.updateDocument(DB_ID, COL_ROOMS, room.$id, {
                last_message_at: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!user || user.labels?.includes("admin")) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-80 md:w-96 mb-4 flex flex-col overflow-hidden"
                        style={{ height: '400px' }}
                    >
                        {/* Header */}
                        <div className="bg-primary1 p-4 flex justify-between items-center text-white">
                            <div>
                                <h3 className="font-bold">Support Chat</h3>
                                <p className="text-xs opacity-80">
                                    {room?.status === 'assigned' ? 'Connected with Admin' : room?.status === 'closed' ? 'Chat Closed' : 'We typically reply in a few minutes'}
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white hover:text-zinc-200 transition">
                                <IoClose size={24} />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 p-4 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 flex flex-col space-y-3">
                            {!room ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="bg-primary1/10 p-4 rounded-full text-primary1">
                                        <IoChatbubbleEllipses size={40} />
                                    </div>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">Have a question? Connect with our support team.</p>
                                    <button
                                        onClick={handleConnectClick}
                                        disabled={loading}
                                        className={`px-6 py-2 rounded-xl text-white font-semibold transition-all shadow-md ${loading ? 'bg-zinc-400' : 'bg-primary1 hover:bg-primary1/90'}`}
                                    >
                                        {loading ? "Connecting..." : "I want to connect in the chat room"}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, i) => {
                                        const isMe = msg.sender_id === user.$id;
                                        return (
                                            <div key={i} className={`max-w-[80%] px-4 py-2 rounded-2xl ${isMe ? 'bg-primary1 text-white self-end rounded-br-none' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 self-start rounded-bl-none'}`}>
                                                <p className="text-sm">{msg.message_text}</p>
                                                <span className="text-[10px] opacity-70 mt-1 block">
                                                    {new Date(msg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {room.status === 'open' && messages.length > 0 && (
                                        <div className="text-xs text-center text-zinc-500 italic my-2">
                                            Waiting for an admin to join...
                                        </div>
                                    )}
                                    {room.status === 'closed' && (
                                        <div className="flex flex-col items-center justify-center p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl my-2 text-center space-y-3">
                                            <p className="text-sm text-zinc-600 dark:text-zinc-300">This chat has been closed by the admin.</p>
                                            <button 
                                                onClick={() => {
                                                    setRoom(null);
                                                    setMessages([]);
                                                }}
                                                className="px-4 py-2 bg-primary1 text-white text-sm font-semibold rounded-lg hover:bg-primary1/90 transition-colors"
                                            >
                                                Start New Chat
                                            </button>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Chat Input */}
                        {room && (
                            <form onSubmit={sendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl focus:ring-1 focus:ring-primary1 focus:outline-none dark:text-white text-sm"
                                    disabled={loading || room.status === 'closed'}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || loading || room.status === 'closed'}
                                    className="p-2 bg-primary1 text-white rounded-xl hover:bg-primary1/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <IoSend size={18} />
                                </button>
                            </form>
                        )}
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
                    className="w-14 h-14 bg-primary1 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-primary1/90 transition"
                >
                    <IoChatbubbleEllipses size={28} />
                </motion.button>
            )}
        </div>
    );
}
