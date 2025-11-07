import React from 'react';

export default function ReviewModal({ service, reviews, averageRating, onClose, newReview, setNewReview, onSubmit }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✖</button>

        <h2 className="text-xl font-semibold mb-2">{service.subcategory} - Reviews</h2>
        <p className="text-sm text-gray-600 mb-4">Average Rating: {averageRating.toFixed(1)} ⭐</p>

        <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="border-b py-2">
                <p className="font-semibold text-gray-800">Rating: {r.rating} ⭐</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-xs text-gray-400">By: {r.customer?.name || 'Anonymous'}</p>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold mb-1">Add Your Review</h3>
          <div className="flex items-center mb-2 gap-2">
            <label>Rating:</label>
            <select value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })} className="border px-2 py-1 rounded">
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <textarea value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })} className="border w-full px-3 py-2 rounded mb-2" placeholder="Write your review..." />
          <button onClick={onSubmit} className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Submit Review</button>
        </div>
      </div>
    </div>
  );
}
