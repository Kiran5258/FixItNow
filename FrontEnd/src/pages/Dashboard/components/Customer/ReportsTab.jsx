import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiSend } from 'react-icons/fi';
import { getReportsByUser, createReport, getProviders, getBookingsByCustomer, getBookingsByProvider, getAllBookings, getAllServices } from '../../../../services/api';

export default function ReportsTab({ user }) {
  const [reports, setReports] = useState([]);
  const [reason, setReason] = useState('');
  const [targetType, setTargetType] = useState('PROVIDER');
  const [targetId, setTargetId] = useState('');

  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (user?.id) fetchReports(user.id);
    fetchAllOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReports = async (id) => {
    try {
      const res = await getReportsByUser(id);
      setReports(res.data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  const fetchAllOptions = async () => {
    try {
      let provRes = { data: [] };
      let bookingRes = { data: [] };

      const serviceRes = await getAllServices();

      if (user.role !== 'PROVIDER') {
        provRes = await getProviders();
      }

      if (user.role === 'CUSTOMER') {
        bookingRes = await getBookingsByCustomer(user.id);
      } else if (user.role === 'PROVIDER') {
        bookingRes = await getBookingsByProvider(user.id);
      } else if (user.role === 'ADMIN') {
        bookingRes = await getAllBookings();
      }

      setProviders(provRes.data || []);
      setBookings(bookingRes.data || []);
      setServices(serviceRes.data || []);
    } catch (err) {
      console.error('Error fetching providers/bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return alert('User not loaded yet.');
    if (!targetId) return alert('Please select a valid target.');

    try {
      await createReport(user.id, targetType, targetId, reason);
      alert('✅ Report submitted successfully!');
      setReason('');
      setTargetId('');
      fetchReports(user.id);
    } catch (err) {
      console.error('Error creating report:', err);
      alert('❌ Failed to submit report.');
    }
  };

  const getTargetOptions = () => {
    if (loading) return [<option key="loading">Loading...</option>];

    switch (targetType) {
      case 'PROVIDER':
        return providers.length > 0
          ? providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name || p.fullName || p.email}</option>
            ))
          : [<option key="noprov">No providers found</option>];

      case 'BOOKING':
        return bookings.length > 0 ? (
          bookings.map((b) => {
            const serviceCategory = b.service?.category || 'Unnamed Category';
            const serviceSubcategory = b.service?.subcategory || 'Unnamed Subcategory';
            const providerName = b.provider?.name || b.provider?.fullName || b.service?.providerName || 'Unknown Provider';
            const date = b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'Unknown Date';
            const status = b.status || 'Pending';

            return (
              <option key={b.id} value={b.id} className="truncate">📅 {date} - {providerName} • {serviceCategory} ({serviceSubcategory}) - {status === 'COMPLETED' ? '✅' : '⏳'}</option>
            );
          })
        ) : (
          <option key="nobook">No bookings found</option>
        );

      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-50 to-gray-100 p-8">
      <div className="flex justify-center mb-10">
        <div className="w-full max-w-3xl h-[470px] backdrop-blur-xl bg-white/60 shadow-2xl rounded-3xl p-8 border border-white/30">
          <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 pb-5 mb-6">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <span className="p-2 bg-red-100 text-red-600 rounded-xl"><FiAlertTriangle size={24} /></span>
              Report an Issue
            </h2>
            <p className="text-gray-700 mt-3 md:mt-0 text-sm bg-white/70 px-4 py-2 rounded-full shadow-sm">👤 Logged in as: <strong>{user?.name || 'Loading...'}</strong></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-gray-700 font-medium mb-1 block">Target Type</label>
                <select className="w-full bg-white/70 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none shadow-sm" value={targetType} onChange={(e) => { setTargetType(e.target.value); setTargetId(''); }}>
                  <option value="PROVIDER">Provider</option>
                  <option value="BOOKING">Booking</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 font-medium mb-1 block">Select Target</label>
                <select className="w-full bg-white/80 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none shadow-md hover:shadow-lg transition-all duration-300 max-h-48 overflow-y-auto text-sm" value={targetId} onChange={(e) => setTargetId(e.target.value)} required>
                  <option value="">-- Select --</option>
                  {getTargetOptions()}
                </select>
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-medium mb-1 block">Reason for Report</label>
              <textarea placeholder="Describe the issue in detail..." className="w-full bg-white/70 border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none resize-none shadow-sm" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:opacity-90 transition-all text-white py-3 rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg transform hover:scale-[1.02]"><FiSend size={20} /> Submit Report</button>
          </form>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Your Previous Reports</h3>

        {reports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r) => {
              const booking = bookings.find((b) => b.id === r.targetId);
              const serviceCategory = booking?.service?.category || 'Unnamed Category';
              const serviceSubcategory = booking?.service?.subcategory || 'Unnamed Subcategory';

              const provider = r.targetType === 'PROVIDER' ? providers?.find((p) => p.id === r.targetId) : null;

              const providerName = provider?.name || provider?.fullName || booking?.provider?.name || booking?.service?.providerName || 'Unknown Provider';
              const date = booking?.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'Unknown Date';
              const status = booking?.status || 'Pending';

              return (
                <div key={r.id} className="bg-white/90 border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-5">
                  <div className="flex flex-col justify-between h-full">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-lg">{r.targetType === 'BOOKING' ? '📘 Booking Report' : '👤 Provider Report'}</h4>
                      {r.targetType === 'PROVIDER' && (<div className="text-sm text-gray-700 leading-tight mb-2">👤 {providerName}</div>)}

                      {r.targetType === 'BOOKING' && (
                        <div className="text-sm text-gray-700 leading-tight mb-2">📅 {date} — {providerName}<br />{serviceCategory} ({serviceSubcategory})<br /><span className={`text-xs font-semibold ${status === 'COMPLETED' ? 'text-green-600' : status === 'CANCELLED' ? 'text-red-600' : 'text-yellow-600'}`}>{status}</span></div>
                      )}

                      <p className="text-sm text-gray-700 mb-1"><strong>Reason:</strong> {r.reason}</p>

                      <strong className="text-sm text-gray-500">Reported on: {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Unknown Date'}</strong>
                    </div>

                    <div className="mt-3 flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${r.status === 'Resolved' ? 'bg-green-100 text-green-700' : r.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>{r.status || 'Pending'}</span>
                      {r.adminResponse && (<p className="text-xs text-gray-600 mt-2 italic text-right">💬 {r.adminResponse}</p>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 italic text-center mt-4">No reports yet. Start by submitting your first one.</p>
        )}
      </div>
    </div>
  );
}
