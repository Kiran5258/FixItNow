import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ChatComponent from "../components/ChatComponent";
import { FiArrowLeft, FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";

const ChatPage = () => {
  const { receiverId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const receiver = location.state?.provider || {};

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#f3e7e9] via-[#e3d3c5] to-[#f9e9d2]"
      style={{ margin: 0, padding: 0 }}
    >
      {/* 🌈 Decorative blurred lights */}
      <div className="absolute w-72 h-72 bg-[#6e290c]/30 rounded-full blur-3xl top-[10%] left-[10%] animate-pulse"></div>
      <div className="absolute w-80 h-80 bg-[#a44a1d]/30 rounded-full blur-3xl bottom-[8%] right-[10%] animate-pulse"></div>

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-8 flex items-center gap-2 text-[#6e290c] hover:text-[#a44a1d] font-medium transition-all duration-200"
      >
        <FiArrowLeft size={22} />
        <span>Back</span>
      </button>

      {/* ✨ Header (Icon + Title + Subtitle in one line) */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mb-6"
      >
        <br></br>
          <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6e290c] to-[#b96d3a] flex items-center justify-center shadow-md">
    <FiMessageSquare size={22} className="text-white" />
  </div>
  <p className="text-sm text-gray-700 font-medium">
    Connect instantly and stay in touch
  </p>
</div>

          
        
      </motion.div>

      {/* 💬 Chat Box Centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl shadow-2xl overflow-hidden border border-[#e5d3c8] bg-white/80 backdrop-blur-md hover:shadow-[#a44a1d]/20 transition-all duration-300"
        style={{
          width: "480px",
          height: "700px",
        }}
      >
        <ChatComponent
          token={token}
          receiverId={parseInt(receiverId)}
          receiverName={receiver.name || "User"}
          theme="customer"
          width="100%"
          height="85wh"
        />
      </motion.div>
     
      <br></br>
      <br></br>

      {/* ⚙️ Footer */}
      <div className="absolute bottom-4 text-xs text-gray-600 select-none">
        Powered by{" "}
        <span className="text-[#6e290c] font-medium">ServiceConnect</span>
      </div>
    </div>
  );
};

export default ChatPage;
