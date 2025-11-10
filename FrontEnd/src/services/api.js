import axios from "axios";
import { API_URL, API_BASE_URL } from "../config/api.config";

// ✅ Create an Axios instance for protected APIs
const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(
  (config) => {
    // Skip attaching token for auth routes
    if (!config.url.includes("/auth/")) {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//
// =====================
// AUTH APIs (no token needed)
// =====================
export const register = (userData) => {
  return axios.post(`${API_URL}/auth/register`, userData);
};

export const login = (credentials) => {
  return axios.post(`${API_URL}/auth/login`, credentials);
};

export const uploadProviderDocument = (providerId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post(
    `${API_URL}/auth/upload-documents/${providerId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};


//
// =====================
// SERVICE APIs (PROVIDER only, token required)
// =====================
export const createService = (data) => API.post("/services", data);
export const getAllServices = () => API.get("/services");
export const getServicesByProvider = (providerId) => API.get(`/services/provider/${providerId}`);
export const updateService = (id, data) => API.put(`/services/${id}`, data);
export const deleteService = (id) => API.delete(`/services/${id}`);

//
// =====================
// USER APIs (token required)
// =====================
export const getAllUsers = () => API.get("/users/all"); // admin only
export const getProviders = () => API.get("/users/providers"); // customers
export const getMyProfile = () => API.get("/users/me");
export const getUserById = (id) => API.get(`/users/id/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getUserByEmail = (email) => API.get(`/users/email/${email}`);
// 👤 Get all customers (for providers or admin)
export const getCustomers = () => API.get("/users/customers");
export const getProviderById = (providerId) => API.get(`/users/id/${providerId}`);



// BOOKING APIs
export const createBooking = (data) => API.post("/bookings/create", data);
export const getBookingsByCustomer = (customerId) =>
  API.get(`/bookings/customer/${customerId}`);
export const getBookingsByProvider = (providerId) =>
  API.get(`/bookings/provider/${providerId}`);
export const updateBookingStatus = (bookingId, status) =>
  API.put(`/bookings/updateStatus/${bookingId}?status=${status}`);
// ADMIN: Get all bookings
export const getAllBookings = () => API.get("/bookings/all");
export const markBookingCompleteByProvider = (bookingId) =>
  API.post(`/bookings/${bookingId}/markComplete`);
export const verifyBookingByCustomer = (bookingId) =>
  API.post(`/bookings/${bookingId}/verify`);



//
// =====================
// REVIEW APIs
// =====================

// ➕ Add a new review
export const addReview = (reviewData) => API.post("/reviews/add", reviewData);

// 📖 Get all reviews for a specific provider
export const getReviewsByProvider = (providerId) =>
  API.get(`/reviews/provider/${providerId}`);

// ⭐ Get average rating for a provider
export const getProviderAverageRating = (providerId) =>
  API.get(`/reviews/provider/${providerId}/average`);

// 👤 Get all reviews written by a specific customer
export const getReviewsByCustomer = (customerId) =>
  API.get(`/reviews/customer/${customerId}`);

// ✏️ Update an existing review
export const updateReview = (reviewId, reviewData) =>
  API.put(`/reviews/update/${reviewId}`, reviewData);

// 🗑️ Delete a review (admin or review owner)
export const deleteReview =  (reviewId) => {
  API.delete(`/reviews/${reviewId}`);
};

// Get review tied to a booking id
export const getReviewByBookingId = (bookingId) => {
  // Use the API client so baseURL and auth header are applied
  return API.get(`/reviews/booking/${bookingId}`);
};

//
// =====================
// CHAT APIs
// =====================

// 📤 Send message (REST fallback if WebSocket not used)
export const sendMessageAPI = (messageData) =>
  API.post("/messages", messageData);

// 📥 Get all messages between logged-in user and another user
export const getMessagesWithUser = (userId) =>
  API.get(`/messages/between/${userId}`);

export const verifyProvider = (providerId) => {
  return API.put(`/users/${providerId}/verify`);
};

export const getAllDocuments = () => API.get("/documents/all");
export const approveDocument = (id) => API.put(`/documents/approve/${id}`);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

// ❌ Admin rejects document (with optional reason)
export const rejectDocument = (id, reason) =>
  API.put(`/documents/reject/${id}`, null, {
    params: { reason },
  });



//
// =====================
// REPORT APIs (Dispute Management)
// =====================

// 📝 Create a new report (Customer or Provider)
export const createReport = (userId, targetType, targetId, reason) => {
  return API.post("/reports/create", null, {
    params: { userId, targetType, targetId, reason },
  });
};

// 📋 Get all reports (Admin only)
export const getAllReports = () => API.get("/reports/all");

// 🔍 Get reports filtered by target type (BOOKING, PROVIDER, CUSTOMER)
export const getReportsByType = (type) => API.get(`/reports/type/${type}`);

// 🧾 Get reports filtered by status (PENDING, RESOLVED, REJECTED)
export const getReportsByStatus = (status) => API.get(`/reports/status/${status}`);

// 👤 Get reports submitted by a specific user
export const getReportsByUser = (userId) => API.get(`/reports/user/${userId}`);

// ✏️ Update report status (Admin)
export const updateReportStatus = (reportId, status) =>
  API.put(`/reports/update-status/${reportId}`, null, {
    params: { status },
  });

// 🗑️ Delete a report (Admin)
export const deleteReport = (reportId) => API.delete(`/reports/${reportId}`);

export const getProviderDocuments = (providerId) => {
  const token = localStorage.getItem("token");
  return API.get(`/documents/provider/${providerId}`)
   
};


//
// =====================
// ADMIN ANALYTICS APIs
// =====================

// 📊 Get overall summary (users, bookings, etc.)
export const getAnalyticsSummary = () => API.get("/admin/analytics/summary");

// 📅 Get monthly bookings trend
export const getBookingsPerMonth = () => API.get("/admin/analytics/bookings/monthly");

// 👑 Get top service providers
export const getTopProviders = () => API.get("/admin/analytics/top-providers");

// 🧾 Get top service categories
export const getTopServices = () => API.get("/admin/analytics/top-services");

// 📍 Get location-wise booking trends
export const getLocationTrends = () => API.get("/admin/analytics/locations");

