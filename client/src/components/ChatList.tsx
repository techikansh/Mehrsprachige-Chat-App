import React, { useState } from "react";
import { MdCancel } from "react-icons/md";

const ChatList = () => {
    const [input, setInput] = useState<string>("");

    return (
        <div className="mt-2 mv-1">
            <div className="flex gap-2 p-2 px-4 justify-between border-b items-center">
                <h1 className="text-3xl font-semibold">Chat</h1>
                <form className="flex gap-2 items-center border rounded-md shadow-sm bg-white w-72">
                    <input
                        type="text"
                        className="w-full h-full rounded-md py-1 px-2 outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Kontakt suchen"
                    />
                    {input && <MdCancel className="text-2xl bg-white cursor-pointer" onClick={() => setInput("")} />}
                </form>
            </div>
        </div>
    );
};

export default ChatList;
