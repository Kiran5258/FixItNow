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