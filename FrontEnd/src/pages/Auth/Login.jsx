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
import { validateEmail } from "../../utils/helper";

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

    if (!validateEmail(email) || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 🔑 Call backend login API
      const res = await login({ email, password });

      // Backend returns { token, role }
      const { token, role } = res.data;

      // Save token for authenticated requests
      localStorage.setItem("token", token);

      // Build logged-in user object
      const loggedInUser = {
        email,
        role,
        hasProfile: role === "PROVIDER" ? false : true, // assume provider profile incomplete until they add services
      };

      // Save in global context
      UpdateUser(loggedInUser);

      // ✅ Redirect logic
      if (role === "PROVIDER") {
        navigate("/provider-dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (role === "CUSTOMER") {
        navigate("/customer-dashboard");
      } else {
        navigate("/"); // fallback → home/dashboard
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Blurred Background */}
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

      {/* Tools Row */}
      <div className="relative z-10 flex space-x-6 mb-8 text-white text-3xl">
        <FaHome title="Home Repair" className="hover:text-indigo-400 transition" />
        <FaWrench title="Plumbing" className="hover:text-indigo-400 transition" />
        <FaTools title="General Services" className="hover:text-indigo-400 transition" />
        <FaBolt title="Electrical" className="hover:text-indigo-400 transition" />
        <FaShower title="Bathroom Fixes" className="hover:text-indigo-400 transition" />
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">Welcome Back</h1>
        <p className="text-white text-lg mb-10 text-center">
          Log in to access your FixItNow account
        </p>

        <form className="w-full flex flex-col space-y-6" onSubmit={handleLogin}>
          {/* Email */}
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-10 pl-10 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-xl"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit Button */}
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
          Don't have an account?{" "}
          <Link to="/register" className="underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
