import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);

  // 1. Connect socket on mount
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join", user._id);

    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [user._id]);

  // 2. Fetch users on mount
  useEffect(() => {
    API.get("/users").then((res) => setUsers(res.data));
  }, []);

  // 3. Open chat with a specific user
  const openChat = async (u) => {
    setSelected(u);
    const res = await API.get(`/messages/${u._id}`);
    setMessages(res.data);
  };

  // 4. Auto-open chat if ?user= is present in URL
  useEffect(() => {
    const targetId = searchParams.get("user");
    if (!targetId || users.length === 0) return;

    const targetUser = users.find((u) => u._id === targetId);
    if (targetUser && (!selected || selected._id !== targetUser._id)) {
      openChat(targetUser);
    }
  }, [users, searchParams]);

  // 5. Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;

    const msg = { sender: user._id, receiver: selected._id, text };
    await API.post("/messages", msg);
    socketRef.current.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-3 gap-4 h-[80vh]">
      {/* Left: User list */}
      <div className="bg-white rounded-xl shadow p-4 overflow-y-auto">
        <h3 className="font-bold mb-3 text-primary">Chats</h3>
        {users.length === 0 ? (
          <p className="text-sm text-gray-400">No users found</p>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => openChat(u)}
              className={`p-2 rounded cursor-pointer mb-1 ${
                selected?._id === u._id ? "bg-indigo-100" : "hover:bg-gray-100"
              }`}
            >
              @{u.username}
            </div>
          ))
        )}
      </div>

      {/* Right: Chat window */}
      <div className="col-span-2 bg-white rounded-xl shadow p-4 flex flex-col">
        {selected ? (
          <>
            <h3 className="font-bold border-b pb-2 mb-2">
              @{selected.username}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`p-2 rounded max-w-xs break-words ${
                    m.sender === user._id
                      ? "bg-primary text-white ml-auto"
                      : "bg-gray-200"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                className="flex-1 border rounded p-2"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="bg-primary text-white px-4 rounded">
                Send
              </button>
            </form>
          </>
        ) : (
          <p className="m-auto text-gray-400">
            Select a user to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
