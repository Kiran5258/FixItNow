import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiLogin,
} from "react-icons/hi";
import { FaHome, FaWrench, FaTools, FaBolt, FaShower } from "react-icons/fa";
import { userContext } from "../../content/Userprovider";
import { login } from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { UpdateUser } = useContext(userContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    // basic checks
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    } else {
      setError("");
    }

    setError("");
    setLoading(true);

    try {
      const res = await login({ email, password });
      const { token, role, verified, message, userId } = res.data;

      if (role === "PROVIDER" && verified === false) {
        setError(
          message ||
            "Your provider account is pending admin verification. Please wait until approved."
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      const loggedInUser = { email, role, userId, verified };
      UpdateUser(loggedInUser);

      if (role === "PROVIDER") navigate("/provider-dashboard");
      else if (role === "ADMIN") navigate("/admin-dashboard");
      else if (role === "CUSTOMER") navigate("/customer-dashboard");
      else navigate("/");
    } catch (err) {
      console.error("Login failed:", err);

      const serverMsg = err?.response?.data?.message || "";

      if (
        serverMsg.toLowerCase().includes("invalid credentials") ||
        err?.response?.status === 401
      ) {
        setError("Incorrect password. Please try again.");
      } else if (
        serverMsg.toLowerCase().includes("user not found") ||
        serverMsg.toLowerCase().includes("email not found") ||
        err?.response?.status === 404
      ) {
        setError("Email does not exist. Please sign up first.");
      } else {
        setError("Unable to login. Please check your network and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
        style={{ backgroundImage: "url('/tools.jpeg')" }}
      ></div>
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Logo */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <div className="relative w-10 h-10">
          <FaHome className="text-white w-full h-full" />
          <FaWrench className="text-black w-5 h-5 absolute bottom-0 right-0" />
        </div>
        <span className="text-white font-bold text-xl">FixItNow</span>
      </div>

      {/* Icons Row */}
      <div className="relative z-10 flex space-x-6 mb-8 text-white text-3xl">
        <FaHome className="hover:text-indigo-400 transition" title="Home Repair" />
        <FaWrench className="hover:text-indigo-400 transition" title="Plumbing" />
        <FaTools className="hover:text-indigo-400 transition" title="General Services" />
        <FaBolt className="hover:text-indigo-400 transition" title="Electrical" />
        <FaShower className="hover:text-indigo-400 transition" title="Bathroom Fixes" />
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome Back</h1>
        <p className="text-white text-lg mb-10 text-center">
          Log in to access your FixItNow account
        </p>

        <form className="w-full flex flex-col space-y-6" onSubmit={handleLogin}>
          {/* Email - wrapper uses relative so icon centers via inset-y-0 */}
          <div className="relative">
            <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
              <HiOutlineMail className="text-white text-xl" />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-12 px-4 py-3 rounded-md border 
                
             bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />

            
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
              <HiOutlineLockClosed className="text-white text-xl" />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-12 pl-12 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 inset-y-0 flex items-center text-white"
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-black/30 p-2 rounded">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 flex items-center justify-center space-x-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
          >
            <HiLogin className="text-xl" />
            <span>{loading ? "Logging In..." : "Log In"}</span>
          </button>
        </form>

        <p className="text-white text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
