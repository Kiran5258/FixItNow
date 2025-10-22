import React, { useState, useEffect } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import {
  getAllServices,
  getReviewsByProvider,
  getProviderAverageRating,
  addReview,
  createBooking,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseAvailability(availStr) {
  const dayTimeRegex =
    /^(\w+)\s*-\s*(\w+)\s+(\d{1,2}\.?\d*)\s*(am|pm)\s*-\s*(\d{1,2}\.?\d*)\s*(am|pm)$/i;
  const match = availStr.match(dayTimeRegex);
  if (!match) return { days: [], slots: [] };

  const [, startDay, endDay, startHour, startMer, endHour, endMer] = match;
  const startIdx = DAYS.indexOf(startDay);
  const endIdx = DAYS.indexOf(endDay);
  const availableDays = DAYS.slice(startIdx, endIdx + 1);

  const parseHour = (h, mer) => {
    let hour = parseFloat(h);
    if (mer.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (mer.toLowerCase() === "am" && hour === 12) hour = 0;
    return hour;
  };

  const start = parseHour(startHour, startMer);
  const end = parseHour(endHour, endMer);

  const slots = [];
  for (let h = start; h < end; h++) {
    const nextH = h + 1;
    const formatHour = (hour) => {
      const suffix = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      return displayHour + ":00 " + suffix;
    };
    slots.push(`${formatHour(h)} - ${formatHour(nextH)}`);
  }

  return { days: availableDays, slots };
}

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [providerServices, setProviderServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [activeTab, setActiveTab] = useState("services");
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [bookingService, setBookingService] = useState(null);

  const [servicePage, setServicePage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allServices = await getAllServices();
        const services = allServices.data.filter(
          (s) => s.providerId === parseInt(id)
        );
        setProviderServices(services);

        const reviewsRes = await getReviewsByProvider(id);
        setReviews(reviewsRes.data || []);

        const avgRes = await getProviderAverageRating(id);
        setAverageRating(avgRes.data || 0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user) return alert("Please log in to submit a review.");
    if (!newReview.comment.trim()) return alert("Please write a comment.");

    try {
      await addReview({
        customer: { id: user.id },
        provider: { id: providerServices[0].providerId },
        service: { id: providerServices[0].id },
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setNewReview({ rating: 5, comment: "" });
      const res = await getReviewsByProvider(id);
      setReviews(res.data || []);
      const avgRes = await getProviderAverageRating(id);
      setAverageRating(avgRes.data || 0);
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    }
  };

  if (!providerServices.length)
    return (
      <p className="text-center mt-10 text-gray-400 animate-pulse">
        Loading...
      </p>
    );

  const provider = providerServices[0];
  const paginatedServices = providerServices.slice(
    (servicePage - 1) * itemsPerPage,
    servicePage * itemsPerPage
  );
  const paginatedReviews = reviews.slice(
    (reviewPage - 1) * itemsPerPage,
    reviewPage * itemsPerPage
  );
  const servicePages = Math.ceil(providerServices.length / itemsPerPage);
  const reviewPages = Math.ceil(reviews.length / itemsPerPage);
  
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1); // go back if possible
    } else {
      navigate("/customer-dashboard"); // fallback page
    }
  };

  return (
    
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-[#f6e5da] to-white min-h-screen">
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#6e290c] font-semibold hover:text-[#a44a1d] transition"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* ---------- LEFT PROFILE PANEL ---------- */}
        <div className="lg:w-1/3 bg-gradient-to-br from-[#6e290c] to-[#a44a1d] rounded-3xl p-6 text-center lg:text-left shadow-2xl sticky top-8 h-fit transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            <img
              src={`https://ui-avatars.com/api/?name=${provider.providerName}&background=6e290c&color=fff&size=128`}
              alt="Provider"
              className="w-28 h-28 rounded-full border-4 border-white shadow-md"
            />
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {provider.providerName}
            </h2>
            <p className="text-white/80">{provider.location}</p>
            <span className="px-3 py-1 bg-white text-[#6e290c] rounded-full font-semibold shadow">
              {provider.category}
            </span>

            <div className="flex justify-between w-full text-center mt-4">
              {[ 
                { label: "Rating", value: averageRating.toFixed(1), color: "text-yellow-300" },
                { label: "Services", value: providerServices.length, color: "text-green-300" },
                { label: "Reviews", value: reviews.length, color: "text-orange-300" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/20 rounded-xl p-3 flex-1 mx-1 backdrop-blur-sm">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="w-full bg-white/20 p-4 rounded-xl text-white mt-4">
              <h3 className="font-semibold mb-1">⏰ Availability</h3>
              <p className="text-white/90">{provider.availability || "Not specified"}</p>
            </div>

            <div className="w-full bg-white/20 p-4 rounded-xl text-white mt-4">
              <h3 className="font-semibold mb-1">👤 About</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                {provider.about || "This provider hasn’t added any details yet."}
              </p>
            </div>

            <div className="w-full bg-white/20 p-4 rounded-xl text-white mt-4">
              <h3 className="font-semibold mb-1">📞 Contact</h3>
              <p>Email: {provider.email || "Not available"}</p>
              <p>Phone: {provider.phone || "Not available"}</p>
              <button className="mt-3 w-full py-2 bg-white/30 rounded-xl font-semibold hover:bg-white/40 transition-all duration-200 text-white">
                Message Provider
              </button>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT PANEL ---------- */}
        <div className="lg:w-2/3 flex-1">
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 pb-2 mb-6">
            {["services", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#6e290c] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab === "services" ? "Services" : "Reviews"}
              </button>
            ))}
          </div>

          {/* Services Tab */}
          {activeTab === "services" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedServices.map((service) => {
                  const available =
                    service.availability &&
                    service.availability.toLowerCase() !== "not available";
                  return (
                    <div
                      key={service.id}
                      className="relative bg-white rounded-2xl shadow-md p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#f1c6ad]"
                    >
                      
                      <h3 className="text-lg font-bold text-[#6e290c] mb-1">{service.subcategory}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{service.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[#6e290c] font-bold text-lg">₹{service.price}</span>
                        <button
                          onClick={() => available && setBookingService(service)}
                          disabled={!available}
                          className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                            available
                              ? "bg-[#6e290c] text-white hover:bg-[#a44a1d]"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {servicePages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: servicePages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setServicePage(i + 1)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        servicePage === i + 1
                          ? "bg-[#6e290c] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {paginatedReviews.length === 0 && (
                <p className="text-gray-400 text-center mt-10 animate-pulse">
                  No reviews yet.
                </p>
              )}
              {paginatedReviews.map((r) => {
                const name = r.customer?.name || "Customer";
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-lg transition-all border border-[#f1c6ad]"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-[#6e290c] flex items-center justify-center text-white font-bold">
                        {name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-[#6e290c]">{name}</p>
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < r.rating ? "opacity-100" : "opacity-30"}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                      </div>
                    </div>
                    
                  </div>
                );
              })}

              {/* Pagination */}
              {reviewPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: reviewPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setReviewPage(i + 1)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        reviewPage === i + 1
                          ? "bg-[#6e290c] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Add Review */}
              <div className="bg-white rounded-2xl shadow-md p-5 mt-6 space-y-3 border border-[#f1c6ad]">
                <h4 className="font-bold text-[#6e290c]">Write a Review</h4>
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({ ...newReview, rating: parseInt(e.target.value) })
                  }
                  className="border w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#6e290c] focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  rows={3}
                  placeholder="Write your review..."
                  className="border w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#6e290c] focus:outline-none"
                />
                <button
                  onClick={handleSubmitReview}
                  className="w-full py-2 bg-[#6e290c] text-white font-semibold rounded-2xl shadow hover:bg-[#a44a1d] transition"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <BookingModal
          service={bookingService}
          customer={user}
          onClose={() => setBookingService(null)}
        />
      )}
    </div>
  );
}

// ---------- Booking Modal ----------
function BookingModal({ service, customer, onClose }) {
  const [formData, setFormData] = useState({ bookingDate: "", timeSlot: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const { days: availableDays, slots: availableSlots } = parseAvailability(service.availability || "");
  const minDate = new Date().toISOString().split("T")[0];

  const isDateDisabled = (date) => !availableDays.includes(DAYS[date.getDay()]);

  const handleDateChange = (e) => {
    const selected = new Date(e.target.value);
    if (isDateDisabled(selected)) {
      alert(`Provider is not available on ${DAYS[selected.getDay()]}`);
      setFormData({ ...formData, bookingDate: "", timeSlot: "" });
    } else {
      setFormData({ ...formData, bookingDate: e.target.value, timeSlot: "" }); // reset slot when date changes
    }
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, timeSlot: slot });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.bookingDate || !formData.timeSlot) {
      setMessage("Please select both date and time slot.");
      setLoading(false);
      return;
    }

    try {
      const res = await createBooking({
        customer: { id: customer.id },
        provider: { id: service.providerId || service.id },
        service: { id: service.id },
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        notes: formData.notes,
        status: "PENDING",
      });
      navigate("/booking-summary", { 
  state: { 
    booking: { 
      ...res.data,      // booking info from API
      service,     
      providerName: service.providerName || provider.providerName // fallback
    } 
  } 
});

      
      onClose();
    } catch (err) {
      setMessage("Booking failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          ✖
        </button>
        <h2 className="text-2xl font-bold text-center text-[#6e290c] mb-3">
          Book {service.subcategory}
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Available: {service.availability || "Not specified"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-semibold text-[#6e290c] mb-1">Booking Date</label>
            <input
              type="date"
              min={minDate}
              value={formData.bookingDate}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#6e290c] focus:outline-none"
            />
          </div>

          {/* Time Slots as Buttons */}
          {formData.bookingDate && (
            <div>
              <label className="block text-sm font-semibold text-[#6e290c] mb-2">Select Time Slot</label>
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    className={`px-3 py-1 rounded-xl border transition ${
                      formData.timeSlot === slot
                        ? "bg-[#6e290c] text-white border-[#6e290c]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-[#f0d4c0]"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-[#6e290c] mb-1">Notes (Optional)</label>
            <textarea
              rows="3"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#6e290c] focus:outline-none"
            />
          </div>

          {message && <p className="text-center text-sm text-red-500 bg-red-50 py-2 rounded-xl">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6e290c] text-white font-semibold rounded-2xl shadow hover:bg-[#a44a1d] transition"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
