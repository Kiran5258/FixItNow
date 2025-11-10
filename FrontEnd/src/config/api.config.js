// Centralized API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
export const API_URL = `${API_BASE_URL}/api`;
export const WS_URL = import.meta.env.VITE_WS_URL || `${API_BASE_URL}/ws`;

export default {
  API_BASE_URL,
  API_URL,
  WS_URL,
};
