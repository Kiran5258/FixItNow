import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../content/Userprovider";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <div className="text-center p-6">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
