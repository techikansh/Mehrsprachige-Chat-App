import React, { useEffect, useRef, useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { BASE_URL, SOCKET_URL } from "../utils/constants";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

interface ChatWindowProps {
    contact: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        prefferedLanguage: string;
        avatar: string;
        status: string;
        lastSeen: Date;
    } | null;
    propChat: {
        _id: string;
        chatType: string;
        commonLanguage: string;
        groupIcon: string;
        groupName: string;
        participants: any[];
        lastMessage: string;
    } | null;
}

const ChatWindow = ({ contact, propChat }: ChatWindowProps) => {
    const [error, setError] = useState<string | null | any>(null);
    const [chatId, setChatId] = useState<string | null>(propChat?._id || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState<string>("");
    const [socket, setSocket] = useState<Socket | null>(null);

    const { email: userEmail, token } = useSelector(
        (state: RootState) => state.user
    );
    const lastMessageRef = useRef<HTMLDivElement>(null);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!message.trim() || !chatId) return;

        try {
            const url = BASE_URL + "chat/sendMessage";
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + token,
                },
                body: JSON.stringify({
                    chatId,
                    receiverId: contact?._id || null,
                    text: message,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage("");
                fetchMessages(chatId);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err : new Error("Failed to send message")
            );
        }
        setMessage("");
    };

    const createOrGetChat = async () => {
        setError(null);
        try {
            const url = BASE_URL + "chat/createChat";
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + token,
                },
                body: JSON.stringify({
                    receiverId: contact?._id,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setChatId(data.chat._id);
                console.log(data.chat._id);
                fetchMessages(data.chat._id);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err : new Error("Failed to create chat")
            );
        }
    };

    const fetchMessages = async (chatId: string) => {
        setError(null);
        try {
            const url = BASE_URL + "chat/getMessages/" + chatId;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    authorization: "Bearer " + token,
                },
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to fetch messages")
            );
        }
    };

    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = "auto"; // Reset height to auto to calculate new height
        textarea.style.height = textarea.scrollHeight + "px"; // Set height based on scrollHeight
    };

    useEffect(() => {
        if (contact) createOrGetChat();
    }, [contact]);
    useEffect(() => {
        console.log(propChat);
    }, []);

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (token) {
            const new_socket = io(SOCKET_URL, {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                auth: {
                    token: token,
                },
            });
            setSocket(new_socket);
        }
    }, [token]);

    useEffect(() => {
        if (socket) {
            socket.connect();
            return () => {
                socket.disconnect();
            };
        }
    }, [socket]);

    useEffect(() => {
        if (chatId && socket) {
            socket.emit("join_chat", chatId);
            socket.on("new_message", (message) => {
                setMessages((prev) => [...prev, message]);
            });

            return () => {
                socket.emit("leave_chat", chatId);
                socket.off("new_message");
            };
        }
    }, [chatId, socket]);

    useEffect(() => {
        if (propChat && propChat._id) {
            setChatId(propChat._id);
            fetchMessages(propChat._id);
        }
    }, [propChat]);

    if (!contact && !propChat) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">
                    Select a contact to start chatting
                </p>
            </div>
        );
    }

    return (
        <>
            {contact && (
                <div className="h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="flex-none bg-white border-b shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={contact.avatar}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="font-medium">{`${contact.firstName} ${contact.lastName}`}</h2>
                                <p className="text-sm text-gray-500">
                                    {contact.status}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {error && (
                            <p className="text-red-500 text-sm">
                                {error.message || String(error)}
                            </p>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`flex ${
                                    msg.sender._id === contact?._id
                                        ? "justify-start"
                                        : "justify-end"
                                } mb-4`}
                            >
                                <div
                                    className={`max-w-[50%] ${
                                        msg.sender._id === contact?._id
                                            ? "bg-white"
                                            : "bg-black text-white"
                                    } rounded-lg p-3 shadow group relative`}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {msg.translatedContent.text}
                                    </p>
                                    {msg.originalContent.text !==
                                        msg.translatedContent.text && (
                                        <div className="absolute invisible group-hover:visible bg-gray-800 text-white p-2 rounded-md -top-8 left-0 whitespace-pre-wrap max-w-[100%] z-10 shadow-lg transition-opacity duration-200 ease-in-out">
                                            {msg.originalContent.text}
                                        </div>
                                    )}
                                    <span className="text-xs opacity-70">
                                        {new Date(
                                            msg.createdAt
                                        ).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div ref={lastMessageRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex-none border-t bg-white p-4">
                        <form
                            className="flex gap-2 items-center"
                            onSubmit={sendMessage}
                        >
                            <textarea
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    autoResize(e);
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        (e.metaKey || e.ctrlKey)
                                    ) {
                                        e.preventDefault();
                                        sendMessage(e);
                                    }
                                }}
                                className="flex-1 px-4 py-2 rounded-md border border-gray-20 outline-none max-h-60 resize-none"
                                rows={1}
                            />

                            <button
                                type="submit"
                                className="max-h-12 bg-black text-white px-6 py-2 rounded-full hover:scale-105 duration-200 "
                            >
                                <BsSendFill />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------- Group Chat ----------- */}

            {propChat && (
                <div className="h-full flex flex-col">
                    {/* Chat Header */}
                    <div className="flex-none bg-white border-b shadow-sm p-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={propChat?.groupIcon}
                                alt="group icon"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                                <h2 className="font-medium">{`${propChat?.groupName}`}</h2>
                                {/* <p className="text-sm text-gray-500">
                                    {propChat?.lastMessage}
                                </p> */}
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {error && (
                            <p className="text-red-500 text-sm">
                                {error.message || String(error)}
                            </p>
                        )}

                        {messages.map((msg) => {
                            console.log(msg, userEmail);
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${
                                        msg.sender.email === userEmail
                                            ? "justify-end"
                                            : "justify-start"
                                    } mb-4`}
                                >
                                    <div
                                        className={`max-w-[50%] ${
                                            msg.sender.email === userEmail
                                                ? "bg-black text-white"
                                                : "bg-white"
                                        } rounded-lg p-3 shadow group relative`}
                                    >
                                        <p className="whitespace-pre-wrap">
                                            {msg.translatedContent.text}
                                        </p>
                                        {msg.originalContent.text !==
                                            msg.translatedContent.text && (
                                            <div className="absolute invisible group-hover:visible bg-gray-800 text-white p-2 rounded-md -top-8 left-0 whitespace-pre-wrap max-w-[100%] z-10 shadow-lg transition-opacity duration-200 ease-in-out">
                                                {msg.originalContent.text}
                                            </div>
                                        )}
                                        <span className="text-xs opacity-70">
                                            {new Date(
                                                msg.createdAt
                                            ).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        <div ref={lastMessageRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex-none border-t bg-white p-4">
                        <form
                            className="flex gap-2 items-center"
                            onSubmit={sendMessage}
                        >
                            <textarea
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    autoResize(e);
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        (e.metaKey || e.ctrlKey)
                                    ) {
                                        e.preventDefault();
                                        sendMessage(e);
                                    }
                                }}
                                className="flex-1 px-4 py-2 rounded-md border border-gray-20 outline-none max-h-60 resize-none"
                                rows={1}
                            />

                            <button
                                type="submit"
                                className="max-h-12 bg-black text-white px-6 py-2 rounded-full hover:scale-105 duration-200 "
                            >
                                <BsSendFill />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWindow;
