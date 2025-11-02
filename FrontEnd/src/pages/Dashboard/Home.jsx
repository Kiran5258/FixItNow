import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import cleaning from "../../images/cleaning.png";
import plumbing from "../../images/plumbing.png";
import electrician from "../../images/electrician.png";
import painting from "../../images/painting.png";



const HomePage = ({ customer, onExploreClick }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!customer;

  const services = [
  { name: "Cleaning", img: cleaning },
  { name: "Plumbing", img: plumbing },
  { name: "Electrician", img: electrician },
  { name: "Painting", img: painting },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Welcome {isLoggedIn ? customer.name : "to FixItNow!"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl"
        >
          {isLoggedIn
            ? "Find trusted professionals near you and get your tasks done easily."
            : "Login or Sign Up to enjoy our trusted home services — quick, reliable, and nearby!"}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-4 flex-wrap justify-center"
        >
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={onExploreClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
            >
              Explore Services
            </button>
          )}
        </motion.div>
      </div>

      {/* Service Preview Grid (only if logged in) */}
      {isLoggedIn && (
        <div className="px-8 pb-20">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-700">
            Our Popular Services
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={service.img}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {service.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
