// API Base URL Configuration
export const BASE_URL = "http://localhost:8080";

// WebSocket URL
export const WS_URL = "http://localhost:8080/ws";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  
  // Users
  USERS: "/api/users",
  MY_PROFILE: "/api/users/me",
  
  // Services
  SERVICES: "/api/services",
  
  // Bookings
  BOOKINGS: "/api/bookings",
  
  // Messages
  MESSAGES: "/api/messages",
  
  // Notifications
  NOTIFICATIONS: "/api/notifications",
  NOTIFICATIONS_UNREAD: "/api/notifications/unread",
  NOTIFICATIONS_COUNT: "/api/notifications/count",
  
  // Reviews
  REVIEWS: "/api/reviews",
};

export default BASE_URL;