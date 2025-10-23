import React from "react";

export default function ProfileTab({
  customer,
  isEditingProfile,
  setIsEditingProfile,
  editProfileData,
  setEditProfileData,
  handleSaveProfile,
  handleCancelProfile,
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow max-w-xl">
      <h2 className="text-xl font-semibold mb-4" style={{ color: "#6e290cff" }}>
        Profile
      </h2>

      {isEditingProfile ? (
        <div className="flex flex-col gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={editProfileData.name}
            onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Email"
            value={editProfileData.email}
            onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Location"
            value={editProfileData.location}
            onChange={(e) => setEditProfileData({ ...editProfileData, location: e.target.value })}
          />
          <div className="flex gap-4">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleSaveProfile}
            >
              Save
            </button>
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={handleCancelProfile}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {customer.name}
          </p>
          <p>
            <strong>Email:</strong> {customer.email}
          </p>
          <p>
            <strong>Location:</strong> {customer.location}
          </p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-700"
            onClick={() => setIsEditingProfile(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
