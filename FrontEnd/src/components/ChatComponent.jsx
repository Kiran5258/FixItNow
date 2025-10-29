/* eslint-disable no-unused-vars */
// src/components/ChatComponent.jsx
import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { FiSend, FiUser, FiWifi, FiWifiOff } from "react-icons/fi";
import { sendMessageAPI, getMessagesWithUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

const ChatComponent = ({
  receiverId,
  receiverName: propReceiverName,
  width = "650px",
  height = "640px",
  theme = "provider",
}) => {
  const { token, user } = useAuth();
  const [receiverName, setReceiverName] = useState(propReceiverName || "");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const themeColors = {
    admin: { primary: "#2563eb", gradient: "linear-gradient(135deg, #2563eb, #60a5fa)" },
    provider: { primary: "#6e290c", gradient: "linear-gradient(135deg, #6e290c, #b45309)" },
    customer: { primary: "#6e290c", gradient: "linear-gradient(135deg, #6e290c, #b45309)" },
  };
  const { primary, gradient } = themeColors[theme] || themeColors.provider;

  // debug - show auth + props
  useEffect(() => {
    console.log("🔎 ChatComponent init", { tokenPresent: !!token, user, receiverId });
  }, [token, user, receiverId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      console.log("💬 Chat updated — last message:", last?.content, "from", last?.senderId);
    }
  }, [messages]);

  // Fetch receiver name
  useEffect(() => {
    if (!receiverId || propReceiverName || !token) return;
    const fetchReceiverName = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/users/id/${receiverId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReceiverName(res.data?.name || "Unknown User");
      } catch (err) {
        console.error("❌ fetchReceiverName error:", err);
        setReceiverName("Unknown User");
      }
    };
    fetchReceiverName();
  }, [receiverId, token, propReceiverName]);

  // Load previous messages with current user
  useEffect(() => {
    if (!token || !receiverId || !user?.id) return;
    console.log("🔁 Fetching messages with user", receiverId);

    // Mark notifications from this sender as read
    axiosInstance
      .put(`/api/notifications/read-from/${receiverId}`)
      .then(() => console.log("✅ Marked notifications from sender as read"))
      .catch((err) => console.error("❌ Failed to mark notifications as read:", err));

    getMessagesWithUser(receiverId)
      .then((res) => {
        setMessages(res.data || []);
      })
      .catch((err) => console.error("❌ Error loading chat:", err));
  }, [receiverId, token, user?.id]);

  // ✅ WebSocket setup
  useEffect(() => {
    if (!token || !user?.email) {
      console.log("⏳ Waiting for auth before opening WS (token/email missing)");
      return;
    }

    console.log("🌐 Opening WS connection for chat", receiverId);
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log("[STOMP]", str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to STOMP");
        setConnected(true);

        const personalQueue = "/user/queue/messages";
        console.log("📡 Subscribing to", personalQueue);

        client.subscribe(
          personalQueue,
          (message) => {
            try {
              const msg = JSON.parse(message.body);
              console.log("📩 Incoming message (raw):", msg);

              const currentChatId = String(receiverId);
              const msgSenderId = String(msg.senderId ?? "");
              const msgReceiverId = String(msg.receiverId ?? "");

              if (msgSenderId === currentChatId || msgReceiverId === currentChatId) {
                console.log(`📨 Message belongs to current chat (${currentChatId}), updating state`);
                setMessages((prev) => {
                  let replaced = false;
                  const next = prev.map((m) => {
                    if (
                      (m.temp && m.content === msg.content) ||
                      (m.id && msg.id && String(m.id) === String(msg.id))
                    ) {
                      replaced = true;
                      return { ...msg };
                    }
                    return m;
                  });
                  if (!replaced) next.push(msg);
                  return next;
                });
              } else {
                console.log("📬 Incoming for other chat — ignoring in this view:", msg);
              }
            } catch (err) {
              console.error("❌ Error parsing WS message:", err);
            }
          },
          { Authorization: `Bearer ${token}` }
        );
      },
      onStompError: (frame) => console.error("❌ STOMP error:", frame),
      onDisconnect: () => {
        console.warn("⚠ STOMP disconnected");
        setConnected(false);
      },
      onWebSocketError: (err) => console.error("❌ WebSocket error:", err),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      console.log("🧹 Cleaning up WebSocket for chat", receiverId);
      client.deactivate();
      setConnected(false);
    };
  }, [token, user?.email, receiverId]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {}, 1500);
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (!input.trim() || !user?.id) return;

    const msgContent = input.trim();
    setInput("");

    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: user.id,
      receiverId,
      content: msgContent,
      senderName: user.name || "You",
      sentAt: new Date().toISOString(),
      temp: true,
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      const client = stompClientRef.current;
      if (client?.connected) {
        console.log(`📤 Sending message to user ${receiverId}:`, msgContent);
        client.publish({
          destination: "/app/chat.sendMessage",
          body: JSON.stringify({ receiverId, content: msgContent }),
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        console.log("🌐 WebSocket not connected, sending via REST API...");
        await sendMessageAPI({ receiverId, content: msgContent });
      }
    } catch (err) {
      console.error("❌ Send failed:", err);
    }
  };

  // Render message row
  const renderMessageRow = (msg, i) => {
    const isSender = String(msg.senderId) === String(user?.id);
    return (
      <div
        key={msg.id || i}
        className={`flex mb-2 items-end ${isSender ? "justify-end" : "justify-start"}`}
      >
        {!isSender && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
            <FiUser className="text-gray-600" />
          </div>
        )}
        <div
          className={`px-3 py-2 rounded-2xl max-w-[100%] text-sm leading-snug break-words shadow ${
            isSender ? "text-white" : "bg-gray-100 text-gray-900"
          }`}
          style={{
            background: isSender ? gradient : undefined,
            borderRadius: isSender ? "18px 18px 0 18px" : "18px 18px 18px 0",
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
      </div>
    );
  };

  const chatHeight =
    theme === "admin" ? "520px" : theme === "provider" ? "640px" : "640px";
    // ✅ Auto-open Admin chat when "openAdminChat" event is fired globally
useEffect(() => {
  const handleOpenAdminChat = () => {
    if (user?.role === "PROVIDER" || user?.role === "CUSTOMER") {
      // You can set receiverId here for admin if you have a fixed adminId
      console.log("📨 Received openAdminChat event — focusing admin chat window");
      // Optionally scroll or focus input, etc.
    }
  };

  window.addEventListener("openAdminChat", handleOpenAdminChat);
  return () => window.removeEventListener("openAdminChat", handleOpenAdminChat);
}, [user]);


  return (
    <div
      className="rounded-2xl shadow-lg flex flex-col bg-white border border-gray-200"
      style={{
        width,
        height: chatHeight,
        maxWidth: "95vw",
        maxHeight: "85vh",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 text-white shadow sticky top-0 z-10"
        style={{ background: gradient }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/25 rounded-full flex items-center justify-center">
            <FiUser size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm">
              Chat with {receiverName || "Loading..."}
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
      </div>
      <br />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scroll-smooth bg-gray-50">
        {!user?.id || messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-6 text-sm">
            {user?.id ? "No messages yet. Start chatting!" : "Loading chat..."}
          </p>
        ) : (
          messages.map((m, i) => renderMessageRow(m, i))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t p-3 bg-white sticky bottom-0">
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
          style={{ backgroundColor: connected ? primary : "#9ca3af" }}
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
