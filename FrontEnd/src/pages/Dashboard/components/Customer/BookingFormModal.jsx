import React, { useState } from 'react';
import { createBooking } from '../../../../services/api';

export default function BookingFormModal({ service, customer, onClose }) {
  const [formData, setFormData] = useState({ bookingDate: '', timeSlot: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.bookingDate || !formData.timeSlot) {
      setMessage('Please select both date and time slot.');
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        customer: { id: customer.id },
        provider: { id: service.providerId || service.id },
        service: { id: service.id },
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        notes: formData.notes,
        status: 'PENDING',
      };

      const res = await createBooking(bookingData);
      console.log('Booking successful:', res.data);
      setMessage('Booking successful!');
      alert('Booking confirmed!');
      onClose();
    } catch (err) {
      console.error('Booking failed:', err.response?.data || err.message);
      setMessage('Booking failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">✖</button>

        <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">Book Service: {service.subcategory}</h2>

        <div className="space-y-4">
          <p className="text-gray-700 text-sm"><strong>Provider:</strong> {service.providerName || 'Unknown'}</p>
          <p className="text-gray-700 text-sm"><strong>Price:</strong> ₹{service.price}</p>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Booking Date</label>
            <input type="date" value={formData.bookingDate} onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })} className="border w-full px-3 py-2 rounded" />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Time Slot</label>
            <select value={formData.timeSlot} onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })} className="border w-full px-3 py-2 rounded">
              <option value="">Select a time</option>
              <option value="9AM - 11AM">9AM - 11AM</option>
              <option value="11AM - 1PM">11AM - 1PM</option>
              <option value="2PM - 4PM">2PM - 4PM</option>
              <option value="4PM - 6PM">4PM - 6PM</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Notes (optional)</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="border w-full px-3 py-2 rounded" placeholder="Any special instructions?" />
          </div>

          <button onClick={handleBookingSubmit} disabled={loading} className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">{loading ? 'Booking...' : 'Confirm Booking'}</button>

          {message && <p className={`text-center mt-2 font-medium ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
