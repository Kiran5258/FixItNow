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
import toast from "react-hot-toast";

export default function Registration() {
  const navigate = useNavigate();

  // User fields
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [location, setLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Provider fields
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("");

  // Created profile preview (for PROVIDER)
  const [createdProfile, setCreatedProfile] = useState(null);

  // 🌍 Get current location
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation(`Lat: ${latitude}, Lng: ${longitude}`);
        },
        () => {
          toast.error("Unable to fetch location. Please enter manually.");
        }
      );
    } else {
      toast.error("Geolocation not supported by your browser.");
    }
  };

  // 📝 Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validations
    if (!fullname || !email || !password || !location) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    if (role === "PROVIDER") {
      if (!category || !subcategory || !description || !price || !availability) {
        setError("Please fill all provider fields.");
        setLoading(false);
        return;
      }
      if (parseFloat(price) <= 0) {
        setError("Price must be greater than 0.");
        setLoading(false);
        return;
      }
    }

    const userData = {
      name: fullname,
      email,
      password,
      role,
      location,
      category: role === "PROVIDER" ? category : undefined,
      subcategory: role === "PROVIDER" ? subcategory : undefined,
      description: role === "PROVIDER" ? description : undefined,
      price: role === "PROVIDER" ? parseFloat(price) : undefined,
      availability: role === "PROVIDER" ? availability : undefined,
    };

    try {
      const res = await register(userData);
      toast.success("Registration successful!");
      if (role === "PROVIDER") setCreatedProfile(userData);
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
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

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-6 py-8 
        rounded-xl backdrop-blur-md shadow-2xl">

        <p className="text-white text-lg mb-6 text-center">
          Create your account below to get started.
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
              className="px-3 py-3 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
            >
              Use Current
            </button>
          </div>

          {/* Role */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option className="bg-black text-white" value="CUSTOMER">Customer</option>
            <option className="bg-black text-white" value="PROVIDER">Provider</option>
          </select>

          {/* Provider fields */}
          {role === "PROVIDER" && (
            <>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Cleaning">Cleaning</option>
              </select>

              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Subcategory</option>
                {category === "Plumbing" && (
                  <>
                    <option value="Pipe Repair">Pipe Repair</option>
                    <option value="Faucet Installation">Faucet Installation</option>
                  </>
                )}
                {category === "Electrical" && (
                  <>
                    <option value="Wiring">Wiring</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                  </>
                )}
                {category === "Carpentry" && <option value="Furniture Repair">Furniture Repair</option>}
                {category === "Cleaning" && <option value="Home Cleaning">Home Cleaning</option>}
              </select>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your services"
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
              />

              <input
                type="number"
                placeholder="Service Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <input
                type="text"
                placeholder="Availability (e.g., Mon-Fri 9:00-18:00)"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </>
          )}

          {/* Error message */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
          >
            {loading ? "Submitting..." : "Sign Up"}
          </button>
        </form>

        {/* Provider profile preview */}
        {createdProfile && (
          <div className="mt-6 p-4 bg-white/10 rounded-lg text-white w-full">
            <h3 className="text-xl font-bold">
              {createdProfile.category} - {createdProfile.subcategory}
            </h3>
            <p>{createdProfile.description}</p>
            <p>Price: ₹{createdProfile.price}</p>
            <p>Availability: {createdProfile.availability}</p>
            <p>Location: {createdProfile.location}</p>
          </div>
        )}

        {/* Login link */}
        <p className="text-white text-sm mt-6">
          Already have an account? <Link to="/login" className="underline font-medium">Log In</Link>
        </p>
      </div>
    </div>
  );
}
