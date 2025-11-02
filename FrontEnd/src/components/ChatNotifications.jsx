/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";


const ChatNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();


  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const dropdownRef = useRef(null);
  const seenIds = useRef(new Set()); // ✅ Track all seen notifications by ID

  useEffect(() => {
    fetchNotifications();
    connectWebSocket();

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
    const role = user?.role || "CUSTOMER";
    console.log("User role in notifications:", role);
  /** ✅ Fetch initial unread notifications */
  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/api/notifications/unread");
      const uniqueNotifications = response.data.filter(
        (n, index, self) => index === self.findIndex((x) => x.id === n.id)
      );
      setNotifications(uniqueNotifications);
      setUnreadCount(uniqueNotifications.length);

      // Store IDs of all fetched notifications
      uniqueNotifications.forEach((n) => seenIds.current.add(n.id));

      console.log(`📊 Loaded ${uniqueNotifications.length} unique unread notifications`);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  /** ✅ WebSocket connection and subscription */
  const connectWebSocket = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ No token found, cannot connect to WebSocket");
      return;
    }

    // Prevent multiple connections
    if (stompClientRef.current && stompClientRef.current.connected) {
      console.log("⚠ Already connected to WebSocket, skipping");
      return;
    }

    try {
      const socket = new SockJS("http://localhost:8080/ws");
      const stompClient = Stomp.over(socket);

      stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          console.log("✅ Connected to WebSocket for notifications");
          setIsConnected(true);
          stompClientRef.current = stompClient;

          // Subscribe to notifications queue
          const subscription = stompClient.subscribe(
            "/user/queue/notifications",
            (message) => {
              const notification = JSON.parse(message.body);
              console.log("🔔 New notification received:", notification);

              // ✅ Skip duplicates using Set
              if (seenIds.current.has(notification.id)) {
                console.log("⚠ Duplicate notification detected, ignoring");
                return;
              }

              seenIds.current.add(notification.id);

              setNotifications((prev) => [notification, ...prev]);
              setUnreadCount((prev) => prev + 1);
              playNotificationSound();
            }
          );

          subscriptionRef.current = subscription;
        },
        (error) => {
          console.error("❌ WebSocket connection error:", error);
          setIsConnected(false);
          setTimeout(connectWebSocket, 5000); // Retry after 5s
        }
      );
    } catch (error) {
      console.error("❌ Failed to establish WebSocket connection:", error);
    }
  };

  const disconnectWebSocket = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    if (stompClientRef.current) {
      stompClientRef.current.disconnect(() => {
        console.log("🔌 Disconnected from WebSocket");
      });
    }
    setIsConnected(false);
  };

  const playNotificationSound = () => {
    const audio = new Audio("/notification-sound.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Could not play sound:", e));
  };

  /** ✅ Mark single notification as read */
  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /** ✅ Mark all notifications as read */
  const markAllAsRead = async () => {
    
    try {
      await axiosInstance.put("/api/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      console.log("📊 All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  /** ✅ Handle click on notification */
  const handleNotificationClick = (notification) => {
  markAsRead(notification.id);

  const senderId = notification.senderId;
  const senderRole = notification.senderRole || "";
  const userRole = user?.role || "";

  console.log("🔎 Notification Clicked:");
  console.log("➡️ Sender ID:", senderId);
  console.log("➡️ Sender Role:", senderRole);
  console.log("➡️ Current User Role:", userRole);
  console.log("➡️ Notification Object:", notification);

  if (senderId === 13) {
    console.log("✅ Sender is ADMIN → Triggering openAdminChat event");
    window.dispatchEvent(new Event("openAdminChat"));
  } else {
    console.log("👤 Sender is not admin → Navigating normally");

    // 🧠 Delay redirect by 2 seconds so console logs are visible
    
      if (userRole === "PROVIDER") {
        localStorage.setItem("activeTab", "6");
        window.location.href = "/provider-dashboard";
      } else if (userRole === "ADMIN") {
        localStorage.setItem("activeTab", "4");
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = `/chat/${senderId}`;
      }
    
  }
};





  /** Utility functions */
  const formatTime = (dateTime) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (message, maxLength = 40) => {
    if (!message) return "";
    return message.length <= maxLength ? message : message.substring(0, maxLength) + "...";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <FiBell className="text-2xl text-gray-700" />

        {/* 🔴 Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* 🟢 Connection Indicator */}
        {isConnected && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* 🔽 Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-bold text-lg text-gray-800">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiBell className="mx-auto text-5xl text-gray-300 mb-3" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                    !n.isRead ? "bg-blue-50/50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {n.senderName?.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-gray-800">
                          {n.senderName}
                        </p>
                        {!n.isRead && (
                          <span className="h-2 w-2 bg-blue-600 rounded-full mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {truncateMessage(n.messageContent)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(n.sentAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  window.location.href = "/notifications";
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatNotifications;
