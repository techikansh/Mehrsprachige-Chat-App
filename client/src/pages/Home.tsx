import ChatList from "../components/ChatList";
import Header from "../components/Header";

const Home = () => {
    return (
        <>
            <Header />

            <div className="h-screen flex">
                {/* <div id="1" className="w-20 2xl:w-28 border p-2">
                    1
                </div> */}
                <div id="2" className="w-[36rem] 2xl:w-[40rem] border bg-gray-100">
                    <ChatList />
                </div>
                <div id="3" className="w-full p-2">
                    3
                </div>
            </div>
        </>
    );
};

export default Home;
