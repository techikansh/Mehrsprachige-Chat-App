import { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import Header from "../components/Header";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [allChats, setAllChats] = useState<any[]>([]);

  const updateChat = (updatedChat: any) => {
    setSelectedChat(updatedChat);
    setAllChats(prevChats => 
      prevChats.map(chat => 
        chat._id === updatedChat._id ? updatedChat : chat
      )
    );
    
  };

  useEffect(() => {
    allChats.map((chat) => {
      console.log(chat?.chatType, chat?.lastMessage?.createdAt)
    })
  }, [allChats])

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[20rem] md:w-[28rem] 2xl:w-[32rem] border bg-gray-100">
          <ChatList 
            setSelectedContact={setSelectedContact} 
            setSelectedChat={setSelectedChat}
            allChats={allChats}
            setAllChats={setAllChats}
          />
        </div>
        <div className="flex-1">
          <ChatWindow 
            contact={selectedContact} 
            propChat={selectedChat} 
            updateChat={updateChat}
            setAllChats={setAllChats}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
