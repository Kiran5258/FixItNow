import axios from "axios";

// ✅ Create an Axios instance for protected APIs
const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// 🔑 Attach JWT token automatically for protected APIs
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
export const register = (userData) =>
  axios.post("http://localhost:8080/api/auth/register", userData);

export const login = (credentials) =>
  axios.post("http://localhost:8080/api/auth/login", credentials);

//
// =====================
// SERVICE APIs (PROVIDER only, token required)
// =====================
export const createService = (data) => API.post("/services", data);
export const getAllServices = () => API.get("/services");
export const getServicesByProvider = (providerId) =>
  API.get(`/services/provider/${providerId}`);
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

//
// =====================
// BOOKING APIs (token required)
// =====================
export const getBookingsByCustomer = (customerId) =>
  API.get(`/bookings/customer/${customerId}`);

// Create a new booking (CUSTOMER)
export const createBooking = (bookingData) => API.post("/bookings/create", bookingData);

// Get all bookings for a customer (CUSTOMER or ADMIN)
export const getCustomerBookings = (customerId) =>
  API.get(`/bookings/customer/${customerId}`);

// Get all bookings for a provider (PROVIDER or ADMIN)
export const getProviderBookings = (providerId) =>
  API.get(`/bookings/provider/${providerId}`);

// ✅ Update booking status (PROVIDER or ADMIN)
export const updateBookingStatus = (bookingId, status) =>
  API.put(`/bookings/updateStatus/${bookingId}?status=${status}`);
// ADMIN: Get all bookings
export const getAllBookings = () => API.get("/bookings/all");



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
