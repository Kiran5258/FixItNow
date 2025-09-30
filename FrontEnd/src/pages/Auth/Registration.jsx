import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { FaHome, FaWrench } from "react-icons/fa";

export default function Registration() {
  const [fullname, setFullname] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        },
        (err) => {
          console.error(err);
          alert("Unable to fetch location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  };

  const handleRegister = (e) => {
  e.preventDefault();
  if (!fullname || !email || !password) {
    setError("Please fill in all required fields");
    return;
  }
  setError("");

  const formData = {
    fullname,
    email,
    password,
    role,
    location,
  };

  //console.log("Registering with:", formData);

  // send to backend API

  // After registration, always redirect to login
  navigate("/login");
};


  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
        style={{ backgroundImage: "url('/tools.jpeg')" }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Logo Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <div className="relative w-10 h-10">
          <FaHome className="text-white w-full h-full" />
          <FaWrench className="text-black w-5 h-5 absolute bottom-0 right-0" />
        </div>
        <span className="text-white font-bold text-xl">FixItNow</span>
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col items-center px-4 py-6 bg-black/30 rounded-lg backdrop-blur-lg">
        <h1 className="text-4xl font-bold text-white mb-4">Join FixItNow</h1>
        <p className="text-white text-lg mb-6 text-center">
          Create your account below to get started.
        </p>

        <form className="w-full flex flex-col space-y-6" onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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

          {/* Location */}
          <div className="relative flex items-center space-x-2">
            <div className="relative flex-grow">
              <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-3 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 rounded-md text-white"
            >
              Use Current
            </button>
          </div>

          {/* Role Dropdown */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option className="bg-black text-white" value="CUSTOMER">Customer</option>
              <option className="bg-black text-white" value="PROVIDER">Provider</option>
              <option className="bg-black text-white" value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>

        <p className="text-white text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline font-medium">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}