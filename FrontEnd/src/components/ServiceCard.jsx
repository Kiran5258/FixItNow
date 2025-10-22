import React, { useState, useEffect } from "react";
import { FiMapPin, FiStar, FiUser } from "react-icons/fi";
import { getReviewsByProvider, getProviderAverageRating, addReview } from "../services/api";

export default function ServiceDetailModal({ service, customer, onClose, onBook }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [service]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviewsByProvider(service.providerId || service.id);
      setReviews(res.data || []);
      const avgRes = await getProviderAverageRating(service.providerId || service.id);
      setAverageRating(avgRes.data || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return alert("Please write a comment.");
    try {
      await addReview({
        customer: { id: customer.id },
        provider: { id: service.providerId || service.id },
        service: { id: service.id },
        rating: newReview.rating,
        comment: newReview.comment,
      });
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (err) {
      console.error(err);
      alert("Failed to submit review.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-20 z-50 overflow-auto">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-2xl shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl">×</button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.subcategory}</h2>
        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
          <FiUser /> {service.providerName || service.name}
        </p>
        {service.location && (
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <FiMapPin /> {service.location}
          </p>
        )}

        <p className="text-gray-700 mb-3">{service.description}</p>
        <p className="font-bold text-blue-600 text-lg mb-3">₹{service.price}</p>
        <p className="text-sm font-semibold mb-3">Average Rating: {averageRating.toFixed(1)} ⭐</p>

        {/* Book Now */}
        <button
          onClick={() => onBook(service)}
          className={`w-full py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-md mb-4`}
        >
          Book Now
        </button>

        {/* Reviews */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Reviews</h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-l-2 border-purple-400 pl-2 py-1 mb-2">
                <p className="font-semibold text-gray-800 text-sm">★ {r.rating}</p>
                <p className="text-gray-700 text-sm">{r.comment}</p>
                <p className="text-xs text-gray-400">By: {r.customer?.name || "Anonymous"}</p>
              </div>
            ))
          )}

          {/* Add Review */}
          <div className="mt-2 border-t pt-2">
            <p className="text-sm font-semibold mb-1">Add Your Review</p>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm">Rating:</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                className="border px-2 py-1 rounded text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="border w-full px-3 py-2 rounded mb-2 text-sm"
              placeholder="Write your review..."
            />
            <button
              onClick={handleSubmitReview}
              className="w-full py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 text-sm"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
