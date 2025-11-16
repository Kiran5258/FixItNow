// Updated Home.jsx with aligned layout and icon-based "How It Works" section
// (Images removed from How It Works section and replaced with icons)

import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import tools from "../../images/tools.png";
import plumbing from "../../images/plumbing.png";
import cleaning from "../../images/cleaning.png";
import electrician from "../../images/electrician.png";
import carpenter from "../../images/carpenter.png";
import mechanic from "../../images/mechanic.png";

import {
  FaHome,
  FaWrench,
  FaStar,
  FaClipboardList,
  FaSignInAlt,
  FaCheckCircle,
} from "react-icons/fa";

function RotatingWords() {
  const words = [
    "Electrical Issues",
    "Plumbing Problems",
    "Cleaning Needs",
    "Carpentry Work",
    "Home Repairs"
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="text-purple-300 drop-shadow-lg transition-all duration-500">
      {words[index]}
    </span>
  );
}

export default function Home() {
  const categories = [
    { name: "Plumbing", image: plumbing },
    { name: "Cleaning", image: cleaning },
    { name: "Electrician", image: electrician },
    { name: "Carpentry", image: carpenter },
    { name: "General Repair", image: tools },
    { name: "Mechanician", image: mechanic },
  ];

  const steps = [
    {
      title: "Choose a Service",
      icon: <FaClipboardList className="text-white text-5xl mx-auto" />,
      desc: "Select from a wide range of home services.",
    },
    {
      title: "Login & Book",
      icon: <FaSignInAlt className="text-white text-5xl mx-auto" />,
      desc: "Quick booking with trusted professionals.",
    },
    {
      title: "Get It Fixed",
      icon: <FaCheckCircle className="text-white text-5xl mx-auto" />,
      desc: "Experts arrive and complete the job.",
    },
  ];

  return (
    <div className="relative py-10 overflow-hidden">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center brightness-45"
        style={{ backgroundImage: `url(${tools})` }}
      ></div>
      <div className="absolute inset-0 bg-black/40"></div>

      {/* NAVBAR */}
      <header className="absolute top-0 w-full px-6 py-4 flex justify-between items-center z-30">
        <div className="flex items-center space-x-3 text-white drop-shadow-lg">
          <div className="relative">
   <FaHome className="text-white text-3xl" />
   <FaWrench className="text-black text-sm absolute bottom-0 right-0" />
</div>

          <span className="text-2xl font-bold">FixItNow</span>
        </div>

        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-5 py-2 text-white rounded-md bg-gradient-to-r 
              from-indigo-500 to-purple-600 hover:scale-105 transition shadow-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-white rounded-md bg-white/20 
              hover:bg-white/30 hover:scale-105 transition shadow-md backdrop-blur-sm"
          >
            Signup
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-20 min-h-screen flex flex-col justify-center items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl"
        >
          Fast & Trusted Home Services
        </motion.h1>

        <motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
  className="text-white text-lg mt-4 max-w-2xl opacity-90 drop-shadow-lg"
>
  Electricians, Plumbers, Carpenters & Cleaners – all just a tap away.
</motion.p>

{/* ROTATING SERVICE WORDS */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.8 }}
  className="text-2xl md:text-3xl font-semibold text-white mt-6 h-10"
>
  <RotatingWords />
</motion.div>


        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10"
        >
          <Link
            to="/login"
            className="px-10 py-3 text-lg rounded-xl bg-gradient-to-r 
            from-purple-500 to-indigo-600 text-white font-semibold 
            shadow-xl hover:scale-110 transition"
          >
            Book a Service
          </Link>
        </motion.div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="relative z-20 py-10 px-6">
        <h2 className="text-center text-3xl font-bold text-white drop-shadow mb-8">
          Popular Services
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className="bg-white/20 backdrop-blur-md border border-white/20 p-4 rounded-xl 
                         hover:bg-white/30 hover:scale-105 shadow-xl cursor-pointer transition"
            >
              <img
                src={cat.image}
                className="h-20 w-full object-contain mx-auto"
              />
              <p className="text-white text-center mt-3 font-semibold">
                {cat.name}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - NEW ICON BASED */}
      <section className="relative z-20 py-10 px-6">
        <h3 className="text-3xl font-bold text-white text-center mb-10 drop-shadow">
          How It Works
        </h3>

        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/20 backdrop-blur-md p-8 rounded-xl border border-white/20 shadow-xl"
            >
              {step.icon}
              <h4 className="text-white text-xl font-semibold mt-4">{step.title}</h4>
              <p className="text-white/80 mt-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="relative z-20 py-10 text-center px-6">
        <h3 className="text-3xl font-bold text-white drop-shadow mb-10">
          Why Choose FixItNow?
        </h3>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            "Verified Professionals",
            "Fast Doorstep Service",
            "Secure Payments",
            "24×7 Support",
          ].map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              viewport={{ once: true }}
              className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-xl border border-white/20"
            >
              <FaStar className="text-yellow-300 text-4xl mx-auto" />
              <p className="text-white font-semibold mt-2">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PROVIDER CTA */}
      <section className="relative z-20 py-20 text-center px-6">
        <h3 className="text-3xl font-bold text-white drop-shadow mb-4">
          Are You a Service Provider?
        </h3>
        <p className="text-white opacity-90 max-w-lg mx-auto mb-6">
          Join FixItNow to connect with real customers and grow your business.
        </p>

        <Link
          to="/register"
          className="px-10 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 
          text-white rounded-xl hover:scale-110 transition shadow-lg"
        >
          Become a Provider
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 text-center py-8 text-white opacity-80">
        © 2025 FixItNow — All Rights Reserved.
      </footer>
    </div>
  );
}