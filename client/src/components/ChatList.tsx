import React, { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import { BASE_URL, SOCKET_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice";
import { RootState } from "../store/store";
import { fetchUser } from "../utils/helper";
// import { useSocket } from "../utils/useSocket";
import { io, Socket } from "socket.io-client";

interface ChatListProps {
  setSelectedContact: React.Dispatch<React.SetStateAction<any>>;
}

const ChatList: React.FC<ChatListProps> = ({ setSelectedContact }) => {
  const [input, setInput] = useState<string>("");
  const { token } = useSelector((state: RootState) => state.user);
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  const dispatch = useDispatch();
  // const socket = useSocket();
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
  },[])

  useEffect(() => {
    if (socket) {
      socket.on("user_status_change", ({ userId, status }) => {
        setAllContacts(prevContacts => 
          prevContacts.map(contact => 
            contact._id === userId 
              ? { ...contact, status } 
              : contact
          )
        );
      });

      return () => {
        socket.off("user_status_change");
      };
    }
  }, [socket]);

  const {
    firstName,
    lastName,
    email,
    prefferedLanguage,
    avatar,
    status,
    lastSeen,
    contacts,
  } = useSelector((state: RootState) => state.user);

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

  useEffect(() => {
    if (input.length >= 3) fetchUsers();
    else setFetchedUsers([]);
  }, [input]);

  useEffect(() => {
    fetchContactsList();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="sticky top-0 bg-white border-b shadow-sm p-4 z-10">
        <div className="flex justify-between items-center max-w-3xl mx-auto gap-2">
          {/* <h1 className="text-2xl font-bold text-gray-800">Messages</h1> */}
          <button className=" bg-black text-white rounded-xl p-2 px2- shrink-0">Gruppe Erstellen</button>

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

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm">
          {allContacts.length > 0 &&
            allContacts.map((contact) => (
              <div
                key={contact._id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={`${contact.firstName}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      {/* Online status indicator */}
                      {contact.status == "online" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {contact.firstName} {contact.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {contact.status}
                      </span>
                    </div>
                  </div>
                  {/* Last message time - You'll need to add this data */}
                  <span className="text-xs text-gray-400">2m ago</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
