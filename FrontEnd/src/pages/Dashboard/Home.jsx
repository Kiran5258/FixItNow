import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import cleaning from "../../images/cleaning.png";
import plumbing from "../../images/plumbing.png";
import electrician from "../../images/electrician.png";
import painting from "../../images/painting.png";

const rustBrown = "#6e290c"; // ✅ Same theme color used in dashboard

const Home = ({ customer, onExploreClick }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!customer;

  const services = [
    { name: "Cleaning", img: cleaning },
    { name: "Plumbing", img: plumbing },
    { name: "Electrician", img: electrician },
    { name: "Painting", img: painting },
  ];

  return (
    <div
      className="min-h-screen text-gray-800 flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${rustBrown}15, #f3ece7)`,
      }}
    >
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-16 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: rustBrown }}
        >
          Welcome {isLoggedIn ? customer?.name : "to FixItNow!"}
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

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex gap-4 flex-wrap justify-center"
        >
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
                style={{ background: rustBrown }}
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
                style={{
                  background: `linear-gradient(135deg, ${rustBrown}, #8c3a1c)`,
                }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={onExploreClick}
              className="text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition"
              style={{ background: `linear-gradient(135deg, ${rustBrown}, #8c3a1c)` }}
            >
              Explore Services
            </button>
          )}
        </motion.div>
      </div>

      {/* Stats section */}
      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: "👨‍🔧", title: "Top Providers", value: "100+" },
              { icon: "📦", title: "Total Bookings", value: "25,000+" },
              { icon: "⭐", title: "Reviews", value: "4.0 / 5.0" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-200"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <p className="text-sm uppercase tracking-wider text-gray-500">{stat.title}</p>
                <p className="text-2xl font-extrabold text-gray-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Services */}
      <div className="px-6 pb-16">
        <h2
          className="text-2xl font-bold text-center mb-8"
          style={{ color: rustBrown }}
        >
          Our Popular Services
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/service/${service.name.toLowerCase()}`)}
            >
              <img src={service.img} alt={service.name} className="w-full h-48 object-cover" />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold" style={{ color: rustBrown }}>
                  {service.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: rustBrown }} className="text-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-semibold">FixItNow</h3>
            <p className="text-orange-200 mt-3 text-sm">
              Quick, reliable home services at your doorstep.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-orange-200">
              <li>About</li>
              <li>Careers</li>
              <li>Blog</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-orange-200">
              <li>Help Center</li>
              <li>How it Works</li>
              <li>Safety</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-orange-200">
              <li>Email: support@fixitnow.app</li>
              <li>Phone: +91 98765 43210</li>
              <li>Chennai, India</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-orange-900">
          <div className="max-w-7xl mx-auto px-6 py-4 text-xs text-orange-200 flex flex-col sm:flex-row justify-between">
            <p>© {new Date().getFullYear()} FixItNow. All rights reserved.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Refund Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
