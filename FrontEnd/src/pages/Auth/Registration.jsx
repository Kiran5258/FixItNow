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
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";


export default function Registration() {
  const [fullname, setFullname] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [skills, setSkills] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch latitude & longitude from typed location using OpenStreetMap API
  const fetchLatLng = async (loc) => {
    if (!loc) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
      } else {
        alert("Location not found");
        setLatitude("");
        setLongitude("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Use current geolocation
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        // Reverse geocoding to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          setLocation(data.address?.city || data.display_name || "Current Location");
        } catch (err) {
          console.error(err);
          setLocation("Current Location");
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to fetch current location");
      }
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullname || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    if (role !== "ADMIN" && !location) {
      setError("Please provide your location");
      return;
    }
    if (role === "PROVIDER" && (!category || !subcategory || !skills || !serviceArea)) {
      setError("Please complete all provider details");
      return;
    }
    if (!latitude || !longitude) {
      setError("Latitude and Longitude are required");
      return;
    }

    setError("");

    const payload = {
      name: fullname,
      email,
      password,
      role,
      location,
      latitude,
      longitude,
      category: role === "PROVIDER" ? category : undefined,
      subcategory: role === "PROVIDER" ? subcategory : undefined,
      skills: role === "PROVIDER" ? skills : undefined,
      serviceArea: role === "PROVIDER" ? serviceArea : undefined,
    };

  try {
  const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, payload);
  console.log(res.data);
  navigate("/login");
  } 
  catch (err) {
  console.error(err);
  setError(err.response?.data?.message || "Registration failed");
}

  };

  return (
    <div className="relative min-h-screen flex flex-col justify-start items-center overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center filter blur-sm scale-105 z-0"
        style={{ backgroundImage: "url('/tools.jpeg')" }}
      ></div>
      <div className="fixed inset-0 bg-black/40 z-0"></div>

      {/* Logo */}
      <div className="fixed top-4 left-4 z-20 flex items-center space-x-2">
        <div className="relative w-10 h-10">
          <FaHome className="text-white w-full h-full" />
          <FaWrench className="text-black w-5 h-5 absolute bottom-0 right-0" />
        </div>
        <span className="text-white font-bold text-xl">FixItNow</span>
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-4 py-12">
        <h1 className="text-5xl font-bold text-white mb-6">Join FixItNow</h1>
        <p className="text-white text-lg mb-10 text-center">
          Grow your service business with us. Enter your details below.
        </p>

        <form className="w-full flex flex-col space-y-4" onSubmit={handleRegister}>
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

          {/* Role */}
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full pl-10 pr-8 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
            >
              <option className="text-black bg-white" value="CUSTOMER">Customer</option>
              <option className="text-black bg-white" value="PROVIDER">Provider</option>
              <option className="text-black bg-white" value="ADMIN">Admin</option>
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white pointer-events-none">▼</span>
          </div>

          {/* Location */}
          {role !== "ADMIN" && (
            <div className="relative">
              <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => fetchLatLng(location)}
                className="w-full pr-24 pl-10 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={useCurrentLocation}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm bg-indigo-500/70 px-2 py-1 rounded"
              >
                Current
              </button>
            </div>
          )}

          {/* Latitude & Longitude (read-only) */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={latitude}
              placeholder="Latitude"
              readOnly
              className="w-1/2 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none"
            />
            <input
              type="text"
              value={longitude}
              placeholder="Longitude"
              readOnly
              className="w-1/2 px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none"
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

          {/* Provider extra fields */}
          {role === "PROVIDER" && (
            <>
              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Service Area"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

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