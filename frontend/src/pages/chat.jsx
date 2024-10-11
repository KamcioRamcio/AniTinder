
import React, {useEffect, useRef, useState} from "react";

import 'react-toastify/dist/ReactToastify.css';

const Chat = () => {
    return (
        <div className="chat-container bg-[#fdf0d5] min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-[#780000] text-white py-4 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <h1 className="text-4xl font-bold">Chat</h1>
                    <button className="bg-red-600 hover:bg-red-700 py-2 px-5 rounded-full">
                        Logout
                    </button>
                </div>
            </header>

            {/* Chat Section */}
            <div className="chat-content flex-grow flex flex-col p-6 space-y-4 overflow-y-auto">
                {/* Example Messages */}
                <div className="message left-message">
                    <div className="message-content bg-[#669bbc] text-white p-4 rounded-lg shadow-md">
                        <p>Hello! How are you doing?</p>
                    </div>
                    <span className="message-time text-gray-500 text-sm mt-2">12:45 PM</span>
                </div>

                <div className="message right-message self-end">
                    <div className="message-content bg-[#780000] text-white p-4 rounded-lg shadow-md">
                        <p>I'm doing great! How about you?</p>
                    </div>
                    <span className="message-time text-gray-500 text-sm mt-2">12:46 PM</span>
                </div>
            </div>

            {/* Input Section */}
            <div className="chat-input bg-white p-4 shadow-lg flex items-center">
                <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-grow p-2 rounded-lg border border-gray-300"
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg ml-4">
                    Send
                </button>
            </div>
        </div>
    );
}

export default Chat;