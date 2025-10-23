<<<<<<< HEAD
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

=======
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
>>>>>>> bc6283a1b8465728100111aba7f88dc8bdddce84
  return children;
};

export default ProtectedRoute;
