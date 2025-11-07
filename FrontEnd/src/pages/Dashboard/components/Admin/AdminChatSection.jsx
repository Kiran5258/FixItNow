import React, { useState } from 'react';

import ChatComponent from '../../../../components/ChatComponent';

export default function AdminChatSection({ users }) {
  const [selectedUser, setSelectedUser] = useState(null);

  // Show only providers and customers (not admins)
  const chatUsers = users.filter(
    (u) => (u.role || "").toLowerCase() !== "admin"
  );

  return (
    <div className="flex flex-col md:flex-row  h-[90vh] bg-white rounded-xl shadow-lg border border-[#6e290c30] overflow-hidden">
      {/* User List Sidebar */}
      <div className="md:w-1/3 w-full bg-[#fff8f4] border-r border-[#6e290c30] overflow-y-auto" >
        <div className="sticky top-0 bg-[#6e290c] text-white p-4 font-semibold text-lg flex items-center justify-between" >
          <span>Chats</span>
          <span className="text-sm font-normal opacity-80" >
            {chatUsers.length} users
          </span>
        </div>

        {chatUsers.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center" >
            No users available
          </div>
        ) : (
          chatUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`p-4 border-b border-[#6e290c20] cursor-pointer transition-colors duration-200 ${
                selectedUser?.id === u.id
                  ? "bg-[#6e290c] text-white"
                  : "hover:bg-[#f8e9e2] text-gray-800"
              }`}
            >
              <div className="flex justify-between items-center" >
                <div>
                  <p className="font-semibold text-base">{u.name}</p>
                  <p
                    className={`text-xs ${
                      selectedUser?.id === u.id
                        ? "text-white/70"
                        : "text-gray-600"
                    }`}
                  >
                    {u.role}
                  </p>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    selectedUser?.id === u.id
                      ? "bg-green-300"
                      : "bg-gray-300"
                  }`}
                  title="Online status"
                ></span>
              </div>
            </div>
          ))
        )}
      </div>

     {/* Right panel: Chat area */}
<div className="flex-1 flex flex-col bg-white h-[30rem]">
  <div className="flex flex-col flex-grow border-l border-[#6e290c30]">
    {selectedUser ? (
      <>
        {/* Header */}

        {/* ChatComponent — full height below header */}
        <div className="flex-1 h-96">
          <ChatComponent receiverId={selectedUser.id}  />
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center flex-1 text-gray-500">
        Select a user to start chatting
      </div>
    )}
  </div>
</div>
    </div>
  );
}
