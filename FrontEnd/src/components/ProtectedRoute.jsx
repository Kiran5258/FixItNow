// src/components/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { userContext } from "../content/Userprovider";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(userContext);

  // If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, allow access to the requested route
  return children;
};

export default ProtectedRoute;
