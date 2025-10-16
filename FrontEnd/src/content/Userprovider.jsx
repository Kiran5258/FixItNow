import React, { createContext, useState, useEffect } from "react";

export const userContext = createContext();

function Userprovider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Update user and persist to localStorage
  const UpdateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Clear user
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <userContext.Provider value={{ user, UpdateUser, clearUser, loading }}>
      {children}
    </userContext.Provider>
  );
}

// Optional custom hook
export const useUser = () => React.useContext(userContext);

export default Userprovider;
