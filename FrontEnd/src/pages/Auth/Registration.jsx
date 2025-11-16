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
import { register } from "../../services/api";
import tools from "../../images/tools.png";


export default function Registration() {
  const [fullname, setFullname] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(null);

  // Provider fields
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availabilityDays, setAvailabilityDays] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const navigate = useNavigate();

  const getCoordinatesFromLocation = async (loc) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          loc
        )}&format=json&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);
      }
    } catch (err) {
      console.error("Error getting coordinates:", err);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            setLocation(
              data.display_name || `Lat: ${latitude}, Lon: ${longitude}`
            );
          } catch {
            alert("Failed to retrieve location details.");
          }
        },
        () => alert("Please allow location access.")
      );
    } else {
      alert("Geolocation not supported by your browser.");
    }
  };

  const formatTime = (t) => {
  if (!t) return "";
  const [hour, minute] = t.split(":");
  const h = parseInt(hour);
  const suffix = h >= 12 ? "pm" : "am";
  const formattedHour = ((h + 11) % 12) + 1;
  return `${formattedHour}.${minute.padStart(2, "0")} ${suffix}`;
};


  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!fullname || !email || !password || !location) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (!latitude || !longitude) {
      await getCoordinatesFromLocation(location);
    }

    if (
      role === "PROVIDER" &&
      (!category ||
        !subcategory ||
        !description ||
        !price ||
        !availabilityDays ||
        !startTime ||
        !endTime ||
        !document)
    ) {
      setError("Please fill all provider fields");
      setLoading(false);
      return;
    }

    const formattedAvailability =
      role === "PROVIDER"
        ? `${availabilityDays} ${formatTime(startTime)} - ${formatTime(endTime)}`
        : "";

    const userData = {
      name: fullname,
      email,
      password,
      role,
      location,
      latitude,
      longitude,
      category,
      subcategory,
      description,
      price: role === "PROVIDER" ? parseFloat(price) : undefined,
      availability: formattedAvailability,
    };

    try {
      const response = await register(userData);
      const { userId, message, role: userRole } = response.data;
      alert(message);

      if (userRole === "PROVIDER" && document) {
        const formData = new FormData();
        formData.append("file", document);

       await fetch(
  `${import.meta.env.VITE_API_URL}/api/auth/upload-documents/${userId}`,
  {
    method: "POST",
    body: formData,
  }
);


      }

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden py-16">
      {/* Background (unchanged) */}
      <div
  className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105"
  style={{ backgroundImage: `url(${tools})` }}
></div>
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Logo */}
      <div className="absolute top-6 left-6 z-20 flex items-center space-x-2">
        <div className="relative w-10 h-10">
          <FaHome className="text-white w-full h-full" />
          <FaWrench className="text-yellow-400 w-5 h-5 absolute bottom-0 right-0" />
        </div>
        <span className="text-white font-bold text-xl">FixItNow</span>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 py-10 mt-6 mb-6 rounded-xl backdrop-blur-md shadow-2xl bg-white/10 border border-white/20">
        <p className="text-white text-lg mb-6 text-center font-medium">
          Create your account below to get started.
        </p>

        <form className="w-full flex flex-col space-y-4" onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80 text-xl" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <HiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80 text-xl" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <HiOutlineLockClosed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80 text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-10 pl-10 px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80 text-xl"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>

          {/* Location */}
          <div className="relative flex items-center space-x-2">
            <div className="relative flex-grow">
              <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/80 text-xl" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-3 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
            >
              Use Current
            </button>
          </div>

          {/* Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option className="bg-white text-black" value="CUSTOMER">
              Customer
            </option>
            <option className="bg-white text-black" value="PROVIDER">
              Provider
            </option>
          </select>

          {/* Provider Fields */}
          {role === "PROVIDER" && (
            <>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option className="bg-white text-black">Select Category</option>
                <option className="bg-white text-black">Plumbing</option>
                <option className="bg-white text-black">Electrical</option>
                <option className="bg-white text-black">Carpentry</option>
                <option className="bg-white text-black">Cleaning</option>
              </select>

              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option className="bg-white text-black">Select Subcategory</option>
                {category === "Plumbing" && (
                  <>
                    <option className="bg-white text-black">Pipe Repair</option>
                    <option className="bg-white text-black">Faucet Installation</option>
                  </>
                )}
                {category === "Electrical" && (
                  <>
                    <option className="bg-white text-black">Wiring</option>
                    <option className="bg-white text-black">Appliance Repair</option>
                  </>
                )}

                {category === "Carpentry" && (
    <>
      <option className="bg-white text-black">Furniture Assembly</option>
      <option className="bg-white text-black">Door Repair</option>
      <option className="bg-white text-black">Custom Woodwork</option>
    </>
  )}

  {category === "Cleaning" && (
    <>
      <option className="bg-white text-black">Home Cleaning</option>
      <option className="bg-white text-black">Office Cleaning</option>
      <option className="bg-white text-black">Carpet Cleaning</option>
    </>
  )}
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your services"
                className="w-full px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
              />

              <input
                type="number"
                placeholder="Service Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Availability */}
              {/* Availability */}
<div className="flex flex-col gap-2">
  <label className="text-white text-sm">
    Availability (24-hour format)
  </label>

  <div className="flex items-center gap-2">
    <input
      type="text"
      placeholder="Days (e.g. Mon - Fri)"
      value={availabilityDays}
      onChange={(e) => setAvailabilityDays(e.target.value)}
      className="flex-1 px-2 py-3 rounded-md border border-white/50 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="time"
      value={startTime}
      onChange={(e) => setStartTime(e.target.value)}
      className="w-1/3 px-3 py-3 rounded-md border border-white/50 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <input
      type="time"
      value={endTime}
      onChange={(e) => setEndTime(e.target.value)}
      className="w-1/3 px-3 py-3 rounded-md border border-white/50 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
</div>


              {/* Document Upload */}
              <div className="w-full">
                <label className="text-white text-sm mb-1 block">
                  Upload Verification Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setDocument(e.target.files[0])}
                  className="w-full text-white bg-white/20 px-3 py-2 rounded-md border border-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
          >
            {loading ? "Submitting..." : "Sign Up"}
          </button>
        </form>

        <p className="text-white text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="underline font-medium hover:text-indigo-300">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
