import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, getMyProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // user object {id, name, role, email}
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMyProfile(); // backend: /api/users/me
          setUser(res.data);
        } catch (err) {
          console.error("Token expired or invalid:", err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // 🔑 Login
  const handleLogin = async (credentials) => {
  try {
    const res = await apiLogin(credentials);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);

    // Fetch full user profile after login
    const profileRes = await getMyProfile();
    setUser(profileRes.data);

    return true;
  } catch (err) {
    console.error("Login failed:", err);
    return false;
  }
};

  // 📝 Register
  const handleRegister = async (userData) => {
    try {
      await apiRegister(userData);
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
