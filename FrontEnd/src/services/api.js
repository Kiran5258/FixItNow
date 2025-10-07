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
export const register = (userData) => {
  return axios.post("http://localhost:8080/api/auth/register", userData);
};

export const login = (credentials) => {
  return axios.post("http://localhost:8080/api/auth/login", credentials);
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
