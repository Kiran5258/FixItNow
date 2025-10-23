<<<<<<< HEAD
import React, { createContext, useState, useEffect } from "react";

export const userContext = createContext();

function UserProvider({ children }) {
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

export default UserProvider;
=======
import React from 'react'
import { createContext,useState } from 'react'

export const userContext=createContext();

function Userprovider({children}) {
    const[user,setuser]=useState(null);
    
    const UpdateUser=(userData)=>{
        setuser(userData)
    }

    const clearUser=()=>{
        setuser(null);
    }
  return (
    <userContext.Provider
    value={{user,UpdateUser,clearUser}}>
        {children}
    </userContext.Provider>
  )
}

export default Userprovider
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
