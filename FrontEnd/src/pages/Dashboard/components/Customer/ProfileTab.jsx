import React, { useState } from 'react';
import { updateUser } from '../../../../services/api';

export default function ProfileTab({ customer, setCustomer, isEditingProfile, setIsEditingProfile, editProfileData, setEditProfileData }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const updatedProfile = { ...customer, ...editProfileData };
      const res = await updateUser(customer.id, updatedProfile);
      setCustomer(res.data);
      setEditProfileData({ ...res.data });
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save profile. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
    setErrorMsg('');
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow w-full max-w-md relative">
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#6e290c' }}>
        My Profile
      </h2>

      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}

      <div className="flex flex-col gap-2">
        {isEditingProfile ? (
          <>
            <input type="text" value={editProfileData.name || ''} onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })} className="border px-3 py-2 rounded" placeholder="Name" />
            <input type="email" value={editProfileData.email || ''} onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })} className="border px-3 py-2 rounded" placeholder="Email" />
            <input type="text" value={editProfileData.location || ''} onChange={(e) => setEditProfileData({ ...editProfileData, location: e.target.value })} className="border px-3 py-2 rounded" placeholder="Location" />

            <div className="flex gap-2 mt-3">
              <button onClick={handleSaveProfile} className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button onClick={handleCancelProfile} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300" disabled={loading}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Location:</strong> {customer.location || 'N/A'}</p>
            <button onClick={() => setIsEditingProfile(true)} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
}
