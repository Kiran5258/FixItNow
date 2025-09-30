import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { FaHome, FaWrench } from "react-icons/fa";

export default function ProviderProfileForm({ user }) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category || !subcategory || !description || !price || !availability || !location) {
      setError("Please fill in all fields");
      return;
    }
    setError("");

    const providerProfileData = {
      providerId: user?.id,
      category,
      subcategory,
      description,
      price,
      availability,
      location,
    };

    // console.log("Submitting provider profile:", providerProfileData);
    // send this data to backend API

    navigate("/");
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
        <h1 className="text-4xl font-bold text-white mb-4">Complete Your Profile</h1>
        <p className="text-white text-lg mb-6 text-center">
          Fill in your service details to start receiving requests.
        </p>

        <form className="w-full flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option className="bg-black text-white" value="">Select Category</option>
            <option className="bg-black text-white" value="Plumbing">Plumbing</option>
            <option className="bg-black text-white" value="Electrical">Electrical</option>
            <option className="bg-black text-white" value="Carpentry">Carpentry</option>
            <option className="bg-black text-white" value="Cleaning">Cleaning</option>
          </select>

          {/* Subcategory */}
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option className="bg-black text-white" value="">Select Subcategory</option>
            {category === "Plumbing" && (
              <>
                <option className="bg-black text-white" value="Pipe Repair">Pipe Repair</option>
                <option className="bg-black text-white" value="Faucet Installation">Faucet Installation</option>
              </>
            )}
            {category === "Electrical" && (
              <>
                <option className="bg-black text-white" value="Wiring">Wiring</option>
                <option className="bg-black text-white" value="Appliance Repair">Appliance Repair</option>
              </>
            )}
            {category === "Carpentry" && (
              <>
                <option className="bg-black text-white" value="Furniture Repair">Furniture Repair</option>
              </>
            )}
            {category === "Cleaning" && (
              <>
                <option className="bg-black text-white" value="Home Cleaning">Home Cleaning</option>
              </>
            )}
          </select>

          {/* Description */}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your services"
            className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={4}
          />

          {/* Price */}
          <input
            type="number"
            placeholder="Service Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Availability */}
          <input
            type="text"
            placeholder="Availability (e.g., Mon-Fri 9:00-18:00)"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-white bg-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Location */}
          <div className="relative flex items-center space-x-2">
            <div className="relative flex-grow">
              <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-xl" />
              <input
                type="text"
                placeholder="Service Location"
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

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-md text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg transition-transform transform hover:scale-105"
          >
            Submit Profile
          </button>
        </form>
      </div>
    </div>
  );
}