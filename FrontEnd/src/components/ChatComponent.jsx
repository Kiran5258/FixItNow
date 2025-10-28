// src/components/ChatComponent.jsx
import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {
  FiSend,
  FiUser,
  FiWifi,
  FiWifiOff,
  FiMoreVertical,
} from "react-icons/fi";
import { sendMessageAPI, getMessagesWithUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const ChatComponent = ({
  receiverId,
  receiverName: propReceiverName,
  width = "420px",
  height = "480px",
  theme = "provider",
}) => {
  const { token, user } = useAuth();
  const [receiverName, setReceiverName] = useState(propReceiverName || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Theme colors per role
  const themeColors = {
    admin: {
      primary: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb, #60a5fa)",
    },
    provider: {
      primary: "#6e290c",
      gradient: "linear-gradient(135deg, #6e290c, #b45309)",
    },
    customer: {
      primary: "#16a34a",
      gradient: "linear-gradient(135deg, #16a34a, #4ade80)",
    },
  };
  const { primary, gradient } = themeColors[theme] || themeColors.provider;

  // Auto scroll to bottom on new message
  useEffect(() => {
    
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch receiver name if missing
  useEffect(() => {
    if (!receiverId || propReceiverName || !token) return;
    const fetchReceiverName = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/users/id/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReceiverName(res.data?.name || "Unknown User");
      } catch {
        setReceiverName("Unknown User");
      }
    };
    fetchReceiverName();
  }, [receiverId, token, propReceiverName]);

  // Fetch previous chat messages
  useEffect(() => {
    
    if (!token || !receiverId || !user?.id) return;
    getMessagesWithUser(receiverId)
      .then((res) => {
        const msgs = res.data || [];
        setMessages(msgs);
        if (!receiverName && msgs.length > 0) {
          const other = msgs.find((m) => m.senderId === receiverId);
          if (other?.senderName) setReceiverName(other.senderName);
        }
      })
      .catch((err) => console.error("❌ Error loading chat:", err));
  }, [receiverId, token]);

  // Setup WebSocket
  useEffect(() => {
    if (!token || !user?.id) return;

    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe("/user/queue/messages", (frame) => {
          const msg = JSON.parse(frame.body);
          if (
            msg.senderId === receiverId ||
            msg.receiverId === receiverId
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [token, user, receiverId]);

  // Handle typing input
  const handleTyping = (e) => {
    setInput(e.target.value);
    setIsTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1500);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || !receiverId) return;
    const msgContent = input.trim();

    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: user?.id,
      receiverId,
      content: msgContent,
      senderName: user?.name || "You",
      sentAt: new Date().toISOString(),
      temp: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    const client = stompClientRef.current;
    try {
      if (client?.connected) {
        client.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify({ receiverId, content: msgContent }),
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await sendMessageAPI({ receiverId, content: msgContent });
      }
    } catch (err) {
      console.error("❌ Message send failed:", err);
    }
  };

  // Render message bubble
  const renderMessageRow = (msg, i) => {
    const isSender = String(msg.senderId) === String(user?.id);
    return (
      <div
        key={msg.id || i}
        className={`flex mb-2 items-end ${
          isSender ? "justify-end" : "justify-start"
        }`}
      >
        {/* Left avatar (receiver messages) */}
        {!isSender && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
            <FiUser className="text-gray-600" />
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm leading-snug break-words shadow ${
            isSender ? "text-white" : "bg-gray-100 text-gray-900"
          }`}
          style={{
            background: isSender ? gradient : undefined,
            borderRadius: isSender
              ? "18px 18px 0 18px"
              : "18px 18px 18px 0",
          }}
        >
          {msg.content}
          <div className="text-[10px] mt-1 opacity-70 text-right">
            {new Date(msg.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Right spacer for sender */}
        {isSender && <div className="w-3" />}
      </div>
    );
  };

  const isAdmin = theme === "admin";
  const adminWidth = "620px";
  const adminHeight = "800px";

  return (
    <div
      className={`rounded-2xl shadow-lg flex flex-col bg-white border border-gray-200 overflow-hidden ${
        isAdmin ? "text-[13px]" : ""
      }`}
      style={{
        width: isAdmin ? adminWidth : width,
        height: isAdmin ? adminHeight : height,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 text-white shadow"
        style={{ background: gradient }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center">
            <FiUser size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {receiverName || "Loading..."}
            </p>
            <p className="text-white/80 flex items-center gap-1 text-xs">
              {connected ? (
                <>
                  <FiWifi size={10} /> Online
                </>
              ) : (
                <>
                  <FiWifiOff size={10} /> Offline
                </>
              )}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <FiMoreVertical className="cursor-pointer hover:text-white/80" />
        )}
      </div>

      {/* Messages container */}
      {(!user?.id || messages.length === 0) ? (
  <p className="text-gray-400 text-center mt-6 text-sm">
    {user?.id ? "No messages yet. Start chatting!" : "Loading chat..."}
  </p>
) : (
  messages.map((m, i) => renderMessageRow(m, i))
)}


      {/* Input area */}
      <div className="flex items-center gap-2 border-t p-3 bg-white">
        <input
          type="text"
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-grow px-3 py-2 border rounded-full bg-gray-50 focus:outline-none text-sm"
          style={{ borderColor: primary }}
        />
        <button
          onClick={sendMessage}
          disabled={!connected}
          className="p-2 rounded-full text-white shadow-md hover:scale-105 transition"
          style={{
            backgroundColor: connected ? primary : "#9ca3af",
          }}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
