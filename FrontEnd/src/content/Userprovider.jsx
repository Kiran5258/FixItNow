import React, { createContext, useState, useEffect } from "react";

export const userContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    // Prefer sessionStorage (session-only login) and fall back to localStorage (remember me)
    const savedUserSession = sessionStorage.getItem("user");
    const savedUserLocal = localStorage.getItem("user");
    const savedUser = savedUserSession || savedUserLocal;
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn("Failed to parse saved user:", e);
      }
    }
    setLoading(false);
  }, []);

  // Update user and persist to either localStorage (remember) or sessionStorage (session-only)
  // persistToLocal: true => localStorage, false => sessionStorage
  const UpdateUser = (userData, persistToLocal = true) => {
    setUser(userData);
    try {
      if (persistToLocal) {
        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("user");
      }
    } catch (e) {
      console.warn("Failed to persist user data:", e);
    }
  };

  // Clear user and tokens from both storages
  const clearUser = () => {
    setUser(null);
    try {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } catch (e) {
      console.warn("Failed to clear storage on logout:", e);
    }
  };

  return (
    <userContext.Provider value={{ user, UpdateUser, clearUser, loading }}>
      {children}
    </userContext.Provider>
  );
}

// Optional custom hook
export const useUser = () => React.useContext(userContext);

export default UserProvider;
