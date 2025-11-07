import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BiClipboard } from 'react-icons/bi';
import { AiOutlineCheckCircle } from 'react-icons/ai';
import { FiClock, FiXCircle, FiUser } from 'react-icons/fi';
import { verifyBookingByCustomer } from '../../../../services/api';

export default function BookingsTab({ bookings, setBookings, reviewsMap }) {
  const navigate = useNavigate();

  const handleCustomerVerify = async (bookingId) => {
    try {
      await verifyBookingByCustomer(bookingId);
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b)));
      alert('Booking marked as completed!');
    } catch (err) {
      console.error('Failed to verify booking:', err);
      alert('Failed to verify booking.');
    }
  };

  const handleLeaveReview = (booking) => {
    navigate(`/provider/${booking.provider.id}`, {
      state: { bookingId: booking.id, serviceId: booking.service.id },
    });
  };

  const getStatusBadge = (b) => {
    if (b.providerMarkedComplete && b.status?.toLowerCase() === 'confirmed') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-semibold">
          Waiting for verification
        </span>
      );
    }

    switch (b.status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-semibold">
            <AiOutlineCheckCircle /> {b.status}
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-semibold">
            <FiClock /> {b.status}
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full font-semibold">
            <FiClock /> {b.status}
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full font-semibold">
            <FiXCircle /> {b.status}
          </span>
        );
      default:
        return <span className="px-2 py-1 bg-gray-100 rounded-full">{b.status}</span>;
    }
  };

  if (!bookings || bookings.length === 0) {
    return <p className="text-black/70 mt-4">No bookings available.</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ color: '#6e290c' }}>
        <BiClipboard /> My Bookings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white border-l-4 rounded-xl p-5 shadow hover:shadow-lg transition flex flex-col gap-3"
            style={{
              borderColor:
                b.status?.toLowerCase() === 'pending'
                  ? '#facc15'
                  : b.status?.toLowerCase() === 'completed'
                  ? '#16a34a'
                  : b.status?.toLowerCase() === 'confirmed'
                  ? '#3b82f6'
                  : '#dc2626',
            }}
          >
            <div className="flex col items-center gap-3">
              <FiUser />
              <h3 className="font-semibold text-lg">{b.provider?.name || 'Unknown'}</h3>
              {getStatusBadge(b)}
            </div>

            <p className="text-sm text-gray-700">
              <span className="font-semibold">{b.service?.category}</span> - {b.service?.subcategory}
            </p>
            <p className="text-sm text-gray-600">{b.service?.description}</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Date:</span> {b.bookingDate} | <span className="font-semibold">Time:</span> {b.timeSlot}
            </p>

            {b.providerMarkedComplete && b.status?.toLowerCase() === 'confirmed' && (
              <button onClick={() => handleCustomerVerify(b.id)} className="px-6 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700">
                Verify & Complete
              </button>
            )}
            {b.status?.toLowerCase() !== 'cancelled' && (
              <button onClick={() => navigate(`/chat/${b.provider.id}`, { state: { provider: b.provider } })} className="px-4 py-2 bg-[#6e290c] text-white rounded-lg hover:bg-[#a44a1d] transition">
                Chat
              </button>
            )}

            {b.status?.toLowerCase() === 'completed' && !reviewsMap[b.id] && (
              <button onClick={() => handleLeaveReview(b)} className="px-4 py-2 bg-[#6e290c] text-white rounded-lg hover:bg-[#a44a1d] transition">
                Leave a Review
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
