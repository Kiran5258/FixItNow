
export const BASE_URL = "http://localhost:8080";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
  },
  CUSTOMER: {
    GET_USER_INFO: "/api/users/me", // customer fetching their own info
    GET_PROVIDERS: "/api/users/providers", // customer fetching all providers
  },
  PROVIDER: {
    GET_USER_INFO: "/api/users/me", // provider fetching their own info
  },
  ADMIN: {
    GET_ALL_USERS: "/api/users/all",
    GET_USER_BY_ID: (id) => `/api/users/${id}`,
    GET_USER_BY_EMAIL: (email) => `/api/users/email/${email}`,
    DELETE_USER: (id) => `/api/users/${id}`,
    UPDATE_USER: (id) => `/api/users/${id}`,
  },
};

