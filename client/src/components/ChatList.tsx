import React, { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import { BASE_URL, SOCKET_URL } from "../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { io, Socket } from "socket.io-client";
import GroupChatModal from "./GroupChatModal";

interface ChatListProps {
  setSelectedContact: React.Dispatch<React.SetStateAction<any>>;
  setSelectedChat: React.Dispatch<React.SetStateAction<string | null>>;
  allChats: any[];
  setAllChats: React.Dispatch<React.SetStateAction<any[]>>;
}

const ChatList: React.FC<ChatListProps> = ({
  setSelectedContact,
  setSelectedChat,
  allChats,
  setAllChats,
}) => {
  const [input, setInput] = useState<string>("");
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const {
    id,
    firstName,
    lastName,
    email,
    prefferedLanguage,
    avatar,
    status,
    lastSeen,
    contacts,
    token,
  } = useSelector((state: RootState) => state.user);

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
  }, []);

  useEffect(() => {
    if (socket) {
      // Join all chat rooms when socket connects
      allChats.forEach((chat) => {
        socket.emit("join_chat", chat._id);
      });

      socket.on("new_message", ({ message, chat }) => {
        // Update the chats list with the new message
        setAllChats((prevChats) => {
          return prevChats.map((prevChat) => {
            if (prevChat._id === chat._id) {
              return { ...prevChat, lastMessage: message };
            }
            return prevChat;
          });
        });

        setAllChats([chat, ...allChats.filter((c) => c._id !== chat._id)]);
      });

      // Status Change
      socket.on("user_status_change", ({ userId, status }) => {
        console.log("Status change received:", userId, status);
        setAllChats((prevChats) =>
          prevChats.map((chat) => ({
            ...chat,
            participants: chat.participants.map(
              (participant: { _id: string; status?: string }) =>
                participant._id === userId
                  ? { ...participant, status }
                  : participant
            ),
          }))
        );
      });

      return () => {
        socket.off("new_message");
        socket.off("user_status_change");
      };
    }
  }, [socket, allChats]);

  const updateContacts = async (user: any) => {
    if (contacts.includes(user._id)) {
      console.log("User is already in contacts");
      setInput("");
      return;
    }
    const url = BASE_URL + "user/updateUser";
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        prefferedLanguage,
        avatar,
        status,
        lastSeen,
        contacts: [...contacts, user._id],
      }),
    });
    const data = await res.json();
    // console.log(data);
    if (data.success) {
      // dispatch(setUser({ ...data.user, token: token }));
      setAllContacts(data.user.contacts);
    }
    setInput("");
  };

  const fetchUsers = async () => {
    setError(null);
    const url = BASE_URL + "chat/findUsers";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        searchString: input,
      }),
    });
    const data = await res.json();
    if (data.success) {
      // console.log(data.users);
      setFetchedUsers(data.users);
    } else {
      setError(data.message);
    }
  };

  const fetchContactsList = async () => {
    const url = BASE_URL + "user/fetchContacts";
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
    });
    const data = await res.json();
    if (data.success) {
      // console.log("contacts: ", data.contacts);
      setAllContacts(data.contacts);
    } else {
      setError(data.message);
    }
  };

  const fetchChats = async () => {
    const url = BASE_URL + "chat/fetchUserChats";
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer " + token,
      },
    });
    const data = await res.json();
    if (data.success) {
      // console.log(data.chats);
      setAllChats(data.chats);
    } else {
      setError(data.message);
    }
  };

  useEffect(() => {
    if (input.length >= 3) fetchUsers();
    else setFetchedUsers([]);
  }, [input]);

  useEffect(() => {
    fetchContactsList();
    fetchChats();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {openModal && (
        <GroupChatModal
          setOpenModal={setOpenModal}
          setSelectedChat={setSelectedChat}
        />
      )}

      {/* Header Section */}
      <div className="sticky top-0 bg-white border-b shadow-sm p-4 z-10">
        <div className="flex justify-between items-center max-w-3xl mx-auto gap-2">
          <button
            className=" bg-black text-white rounded-xl p-2 px2- shrink-0"
            onClick={() => setOpenModal(true)}
          >
            Gruppe Erstellen
          </button>

          {/* Search Section */}
          <div className="relative w-72">
            <form className="relative" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search contacts..."
              />
              {input && (
                <MdCancel
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  onClick={() => {
                    setInput("");
                    setFetchedUsers([]);
                  }}
                />
              )}
            </form>

            {/* Search Results Dropdown */}
            {fetchedUsers.length > 0 && (
              <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-20">
                {fetchedUsers.map((fetchedUser, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                    onClick={() => updateContacts(fetchedUser)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={fetchedUser.avatar}
                        alt={`${fetchedUser.firstName}'s avatar`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {fetchedUser.firstName} {fetchedUser.lastName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {fetchedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 mt-4">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm">
          {allChats.length > 0 &&
            allChats.map((chat) => {
              // console.log(chat)

              const receiver = chat.participants.filter(
                (p: any) => p.email != email
              )[0];

              // Group Chats
              if (chat.chatType === "group") {
                return (
                  <div
                    key={chat._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                    onClick={() => {
                      setSelectedContact(null); // Add this
                      setSelectedChat(chat);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={chat.groupIcon}
                            alt={`chat group icon`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {chat.groupName}
                          </span>
                          
                          {chat?.lastMessage && (
                            <span
                              className={`${
                                (chat?.lastMessage?.readBy || []).includes(id)
                                  ? "text-xs text-gray-500"
                                  : "text-xs text-gray-900 font-bold"
                              }`}
                            >
                              {id === chat?.lastMessage?.sender
                                ? "You: "
                                : `${
                                    chat?.participants.find(
                                      (p: any) =>
                                        p._id === chat?.lastMessage?.sender
                                    )?.firstName || "Unknown"
                                  }: `}
                              {chat?.lastMessage?.translatedContent?.text.slice(
                                0,
                                40
                              )}
                              ...
                            </span>
                          )}
                        </div>
                      </div>

                      {chat?.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {new Date(
                            chat?.lastMessage?.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // Direct Messages
              return receiver ? (
                <div
                  key={chat._id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                  onClick={() => {
                    setSelectedChat(null); // Add this
                    setSelectedContact(receiver);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={receiver.avatar}
                          alt={`${receiver.firstName}'s avatar`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        {receiver.status === "online" && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">
                          {receiver.firstName} {receiver.lastName}
                        </span>

                        {chat?.lastMessage && (
                          <span
                            className={`${
                              (chat?.lastMessage?.readBy || []).includes(id)
                                ? "text-xs text-gray-500"
                                : "text-xs text-gray-900 font-bold"
                            }`}
                          >
                            {id === chat?.lastMessage?.sender
                              ? "You: "
                              : receiver.firstName + ": "}
                            {chat?.lastMessage?.translatedContent?.text.slice(
                              0,
                              40
                            )}
                            ...
                          </span>
                        )}
                      </div>
                    </div>
                    {chat?.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {new Date(
                          chat?.lastMessage?.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ) : null;
            })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
