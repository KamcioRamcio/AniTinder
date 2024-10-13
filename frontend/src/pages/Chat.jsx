import React, {useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import api from "../api.js";
import {useNavigate} from "react-router-dom";

const Chat = ({currentUserId}) => {
    const {roomName} = useParams();
    const navigate = useNavigate();
    const otherUserId = roomName.split('_').find(id => id !== currentUserId);
    const [messages, setMessages] = useState({});
    const [newMessage, setNewMessage] = useState("");
    const socketRef = useRef(null);
    const messageContainerRef = useRef(null);
    const [profileData, setProfileData] = useState({});

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/chat/${roomName}/messages/`);
                const data = response.data;
                if (Array.isArray(data)) {
                    const messagesDict = data.reduce((acc, message) => {
                        acc[message.id] = message;
                        return acc;
                    }, {});
                    setMessages(messagesDict);
                } else {
                    console.error("Fetched data is not an array:", data);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        const fetchProfileData = async (id) => {
            try {
                const response = await api.get(`/user/profile/${id}/`);
                const data = response.data;
                setProfileData((prevData) => ({
                    ...prevData, [id]: data,
                }));
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        if (otherUserId) {
            fetchMessages();
            fetchProfileData(otherUserId);
            fetchProfileData(currentUserId);

            const socketUrl = process.env.NODE_ENV === 'production' ? `wss://your-production-url/ws/chat/${roomName}/` : `ws://localhost:8000/ws/chat/${roomName}/`;
            socketRef.current = new WebSocket(socketUrl);

            socketRef.current.onopen = () => {
                console.log("WebSocket connection established");
            };

            socketRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("Received message:", data); // Log received message for debugging

                setMessages((prevMessages) => ({
                    ...prevMessages,
                    [data.timestamp]: {
                        id: data.timestamp, // Temporary ID using timestamp
                        sender: data.sender,
                        receiver: data.receiver,
                        content: data.message,
                        timestamp: data.timestamp
                    }
                }));

                if (!profileData[data.sender]) {
                    fetchProfileData(data.sender);
                }
                scrollToBottom();
            };

            socketRef.current.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socketRef.current.onclose = () => {
                console.log("WebSocket connection closed");
            };

            return () => {
                socketRef.current.close();
            };
        } else {
            console.error("otherUserId is undefined. Check the route and ensure it's being passed correctly.");
        }
    }, [currentUserId, otherUserId, roomName]);

    const sendMessage = () => {
        if (newMessage.trim() === "") {
            return;
        }

        const message = {
            content: newMessage,
            sender: currentUserId,
            receiver: otherUserId,
            room: roomName,
        };

        socketRef.current.send(JSON.stringify(message));
        setNewMessage("");
    }

    const scrollToBottom = () => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const linkify = (text) => {
        const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(urlPattern, (url) => {
            const domain = url.replace(/^(https?|ftp|file):\/\/([^\/]+).*/, '$2');
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${domain}</a>`;
        });
    };
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/login";
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#fdf0d5]">
            <div className="chat-container bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
                <header className="bg-[#780000] text-white py-4 shadow-lg rounded-t-lg">
                    <div className="container mx-auto flex items-center justify-between">
                        <h1 className="text-4xl font-bold">Chat</h1>
                        <button
                            className="bg-red-600 hover:bg-red-700 py-2 px-5 rounded-full"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-full mr-2 shadow-lg"
                        >
                            Go Back
                        </button>
                    </div>
                </header>

                <div ref={messageContainerRef}
                     className="chat-content flex-grow flex flex-col p-4 overflow-y-auto h-96">
                    {Object.values(messages).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((message) => (
                        <div key={message.id} className={`message flex ${message.sender == currentUserId ? "justify-end" : "justify-start"}`}>
                            <div className={`flex items-center space-x-2 max-w-xs ${message.sender == currentUserId ? "text-right" : "text-left"}`}>
                                {message.sender != currentUserId && (
                                    <img
                                        src={profileData[message.sender]?.profile_image}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold">{profileData[message.sender]?.username}</span>
                                    </div>
                                    <div className={`message-content p-4 rounded-lg shadow-md ${message.sender == currentUserId ? "bg-[#780000] text-white" : "bg-[#669bbc] text-black"}`}>
                                        <p dangerouslySetInnerHTML={{ __html: linkify(message.content) }}></p>
                                    </div>
                                    <span className="message-time text-gray-500 text-sm mt-2">{new Date(message.timestamp).toLocaleTimeString()}</span>
                                </div>
                                {message.sender == currentUserId && (
                                    <img
                                        src={profileData[message.sender]?.profile_image}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-input bg-white p-4 shadow-lg flex items-center rounded-b-lg">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow p-2 rounded-lg border border-gray-300"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg ml-4"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;