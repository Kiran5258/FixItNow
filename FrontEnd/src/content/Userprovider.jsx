import React, { createContext, useState } from "react";

// Create context
export const userContext = createContext();

export default function Userprovider({ children }) {
  const [user, setUser] = useState(null);

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Clear user data
  const clearUser = () => {
    setUser(null);
  };

  return (
    <userContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </userContext.Provider>
  );
}