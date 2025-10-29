import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const ChatComponent = ({ token, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!token || !receiverId) return;

    const connectStomp = () => {
      console.log("🔹 Connecting STOMP...");

      const stompClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => console.log("🪵 STOMP DEBUG:", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      stompClient.onConnect = async (frame) => {
        console.log("✅ STOMP connected:", frame.headers);
        setConnected(true);
        setError(null);

        // Fetch previous messages after connection
        try {
          const res = await fetch(
            `http://localhost:8080/api/messages/between/${receiverId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = await res.json();
          console.log("📜 Previous messages:", data);
          setMessages(data);
        } catch (err) {
          console.error("❌ Failed to fetch previous messages:", err);
        }

        // Subscribe to real-time messages
        stompClient.subscribe(`/user/queue/messages`, (message) => {
          try {
            const msgBody = JSON.parse(message.body);
            // Only add messages relevant to this chat
            if (
              msgBody.senderId === receiverId ||
              msgBody.receiverId === receiverId
            ) {
              setMessages((prev) => [...prev, msgBody]);
            }
          } catch (e) {
            console.error("❌ Failed to parse incoming message:", e);
          }
        });

        console.log("📥 Subscribed to /user/queue/messages");
      };

      stompClient.onStompError = (frame) => {
        console.error("❌ STOMP error:", frame.headers["message"]);
        setError(frame.headers["message"] || "STOMP error");
        setConnected(false);
      };

      stompClient.onWebSocketClose = () => {
        console.warn("⚠️ WebSocket closed");
        setConnected(false);
      };

      stompClient.onWebSocketError = (evt) => {
        console.error("❌ WebSocket error:", evt);
        setError("WebSocket error");
        setConnected(false);
      };

      stompClient.activate();
      stompClientRef.current = stompClient;
    };

    connectStomp();

    return () => {
      if (stompClientRef.current) {
        console.log("🔹 Deactivating STOMP client");
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, [token, receiverId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const client = stompClientRef.current;
    if (!client || !client.active) {
      console.warn("❌ STOMP client not connected, message not sent");
      return;
    }

    const message = {
      receiverId: receiverId,
      content: input,
    };

    console.log("📝 Sending message:", message);

    // Publish message to backend
    client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
      headers: { Authorization: `Bearer ${token}` },
    });

    // Append message locally for instant feedback
    setMessages((prev) => [
      ...prev,
      {
        senderId: "me",
        senderName: "You",
        receiverId,
        content: input,
      },
    ]);

    setInput("");
  };

  return (
    <div style={{ border: "1px solid gray", padding: "1rem", width: "400px" }}>
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          marginBottom: "1rem",
          border: "1px solid #ccc",
          padding: "0.5rem",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx}>
            <b>You :</b> {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ width: "80%" }}
      />
      <button
        onClick={sendMessage}
        style={{ width: "18%", marginLeft: "2%" }}
        disabled={!connected}
      >
        Send
      </button>

      {!connected && (
        <div style={{ color: "red", marginTop: "0.5rem" }}>Connecting...</div>
      )}
      {error && (
        <div style={{ color: "orange", marginTop: "0.5rem" }}>Error: {error}</div>
      )}
    </div>
  );
};

export default ChatComponent;
