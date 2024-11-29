import React from 'react';
import { BsSendFill } from "react-icons/bs";

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

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
    }




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
        {/* Messages will go here */}
      </div>

      {/* Message Input */}
      <div className="flex-none border-t bg-white p-4">
        <form className="flex gap-2" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
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