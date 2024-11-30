import React, { useEffect, useState } from "react";
import { BsSendFill } from "react-icons/bs";
import { BASE_URL } from "../utils/constants";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";

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
}

const ChatWindow = ({ contact }: ChatWindowProps) => {
  const [error, setError] = useState<string | null | any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>("");

  const { token } = useSelector((state: RootState) => state.user);

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
          receiverId: contact?._id,
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
      setError(err instanceof Error ? err : new Error('Failed to send message'));
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
        console.log(data.chat._id)
        fetchMessages(data.chat._id);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create chat'));
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
      setError(err instanceof Error ? err : new Error('Failed to fetch messages'));
    }
  };

  useEffect(() => {
    if (contact) createOrGetChat();
  }, [contact]);

  if (!contact) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a contact to start chatting</p>
      </div>
    );
  }

  return (
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
            <p className="text-sm text-gray-500">{contact.status}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {error && <p className="text-red-500 text-sm">{error.message || String(error)}</p>}
        {/* Messages will go here */}
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender._id === contact?._id ? "justify-start" : "justify-end"
            } mb-4`}
          >
            <div
              className={`max-w-[50%] ${
                msg.sender._id === contact?._id
                  ? "bg-white"
                  : "bg-black text-white"
              } rounded-lg p-3 shadow`}
            >
              <p className="whitespace-pre-wrap">{msg.originalContent.text}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex-none border-t bg-white p-4">
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 rounded-full border border-gray-20 outline-none"
          />
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-full hover:scale-105 duration-200 "
          >
            <BsSendFill />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
