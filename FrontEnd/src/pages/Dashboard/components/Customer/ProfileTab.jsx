import React, { useState } from "react";
import { updateUser } from "../../../../services/api";
import { FiEdit2, FiSave, FiX, FiMapPin, FiMail, FiUser } from "react-icons/fi";

export default function ProfileTab({
  customer,
  setCustomer,
  isEditingProfile,
  setIsEditingProfile,
  editProfileData,
  setEditProfileData,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveProfile = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const updatedProfile = { ...customer, ...editProfileData };
      const res = await updateUser(customer.id, updatedProfile);

      setCustomer(res.data);
      setEditProfileData({ ...res.data });
      setIsEditingProfile(false);

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMsg(
        err.response?.data?.message || "Failed to save profile. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProfile = () => {
    setEditProfileData({ ...customer });
    setIsEditingProfile(false);
    setErrorMsg("");
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-2xl overflow-hidden border border-[#d5b09c]/40">
        {/* LEFT PANEL */}
        <aside className="md:w-1/3 bg-gradient-to-b from-[#5b210a] to-[#9a4720] text-white flex flex-col justify-center items-center p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-5">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-white/20 border-4 border-white shadow-md text-3xl font-bold tracking-wide">
              {customer?.name
                ? customer.name
                    .split(" ")
                    .map((n, i) => (i === 0 ? n.slice(0, 2) : n[0]))
                    .join("")
                    .toUpperCase()
                : "U"}
            </div>

            <h3 className="text-2xl font-semibold tracking-wide drop-shadow-sm">
              {customer?.name || "Customer"}
            </h3>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <FiMail /> {customer?.email || "Not available"}
            </p>
            <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
              <FiMapPin />
              {customer?.location || "Add location"}
            </div>

            <button
  onClick={() => {
    if (!isEditingProfile) {
      // when opening edit mode, pre-fill data
      setEditProfileData({ ...customer });
    }
    setIsEditingProfile((v) => !v);
  }}
  className="mt-4 flex items-center gap-2 px-5 py-2 bg-white text-[#5b210a] rounded-full font-semibold hover:bg-[#f3e5dc] transition-all duration-300 shadow-md hover:shadow-lg"
>

              {isEditingProfile ? <FiX /> : <FiEdit2 />}
              {isEditingProfile ? "Close Editor" : "Edit Profile"}
            </button>
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <section className="flex-1 bg-[#fffaf8] p-10">
          <div className="mb-6 border-b-2 border-[#5b210a]/20 pb-2">
            <h2 className="text-2xl font-bold text-[#5b210a] tracking-wide">
              {isEditingProfile ? "Edit Profile" : "Profile Details"}
            </h2>
          </div>

          {errorMsg && (
            <div className="mb-4 px-4 py-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
              {errorMsg}
            </div>
          )}

          {isEditingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <FiUser className="text-[#5b210a]" /> Full Name
                </label>
                <input
                  type="text"
                  value={editProfileData.name || ""}
                  onChange={(e) =>
                    setEditProfileData({ ...editProfileData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#9a4720] focus:outline-none shadow-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <FiMail className="text-[#5b210a]" /> Email
                </label>
                <input
                  type="email"
                  value={editProfileData.email || ""}
                  
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed shadow-sm"
                />
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <FiMapPin className="text-[#5b210a]" /> Location
                </label>
                <input
                  type="text"
                  value={editProfileData.location || ""}
                  onChange={(e) =>
                    setEditProfileData({
                      ...editProfileData,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#9a4720] focus:outline-none shadow-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex flex-wrap gap-4 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-[#5b210a] to-[#9a4720] hover:from-[#7a3114] hover:to-[#b85d2a] transition-all shadow-md hover:shadow-lg ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <FiSave />
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={handleCancelProfile}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm transition-all"
                >
                  <FiX /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Info Card */}
              <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiUser className="text-[#9a4720]" /> Full Name
                </p>
                <p className="font-semibold text-gray-800 mt-1 ">
                  {customer?.name || "—"}
                </p>
              </div>

              <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiMail className="text-[#9a4720]" /> Email
                </p>
                <p className="font-semibold text-gray-800 mt-1 break-all">
                  {customer?.email || "—"}
                </p>
              </div>

              <div className="p-5 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition md:col-span-2">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <FiMapPin className="text-[#9a4720]" /> Location
                </p>
                <p className="font-semibold text-gray-800 mt-1 ">
                  {customer?.location || "Add your location"}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
