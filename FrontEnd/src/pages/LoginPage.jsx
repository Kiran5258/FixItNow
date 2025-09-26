import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../services/authService";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const data = await loginUser(email, password);
    // Navigate based on role
    if (data.role === "customer") navigate("/customer-dashboard");
    else if (data.role === "provider") navigate("/provider-dashboard");
    else if (data.role === "admin") navigate("/admin-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;
