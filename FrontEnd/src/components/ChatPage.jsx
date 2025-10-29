// src/pages/ChatPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatComponent from "../components/ChatComponent";

const ChatPage = () => {
  const { receiverId } = useParams();
  const { token } = useAuth();

  console.log("🧩 ChatPage Params:", receiverId, "Token:", token);

  return <ChatComponent token={token} receiverId={parseInt(receiverId)} />;
};

export default ChatPage;
