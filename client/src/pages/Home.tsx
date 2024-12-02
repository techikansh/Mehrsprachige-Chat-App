import { useState } from "react";
import ChatList from "../components/ChatList";
import Header from "../components/Header";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [selectedContact, setSelectedContact] = useState<any>(null);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[20rem] md:w-[28rem] 2xl:w-[32rem] border bg-gray-100">
          <ChatList setSelectedContact={setSelectedContact} />
        </div>
        <div className="flex-1">
          <ChatWindow contact={selectedContact} />
        </div>
      </div>
    </div>
  );
};

export default Home;
