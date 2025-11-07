import React, { useEffect, useState } from "react";
import {
  getAllReports,
  updateReportStatus,
  deleteReport,
} from  "../../services/api";
import { FaCheckCircle, FaTimesCircle, FaTrashAlt } from "react-icons/fa";

const DisputeManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data } = await getAllReports();
      setReports(data);
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateReportStatus(id, status);
     if(!window.confirm(`Report marked as ${status}`)) return;
      alert("Report status updated successfully");
      loadReports();
    } catch (err) {
      console.error("❌ Error updating report:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport(id);
      alert("Report deleted successfully");
      loadReports();
    } catch (err) {
      console.error("❌ Error deleting report:", err);
    }
  };

  const filteredReports =
    filter === "ALL"
      ? reports
      : reports.filter((r) => r.status.toUpperCase() === filter);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🧾 Dispute Management
      </h2>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <label className="mr-2 font-semibold text-gray-700">
            Filter by Status:
          </label>
          <select
            className="p-2 border rounded-md shadow-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <button
          onClick={loadReports}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md"
        >
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left"
              >
                <th className="p-3 border-b">ID</th>
                <th className="p-3 border-b">Type</th>
                <th className="p-3 border-b">Target ID</th>
                <th className="p-3 border-b">Reason</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Reported By</th>
                <th className="p-3 border-b">Created At</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="p-3 border-b">{r.id}</td>
                  <td className="p-3 border-b">{r.targetType}</td>
                  <td className="p-3 border-b">{r.targetId}</td>
                  <td className="p-3 border-b">{r.reason}</td>
                  <td
                    className={`p-3 border-b font-semibold ${
                      r.status === "PENDING"
                        ? "text-yellow-600"
                        : r.status === "RESOLVED"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="p-3 border-b">
                    {r.reportedBy?.name || "Unknown"}
                  </td>
                  <td className="p-3 border-b">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border-b text-center">
  <div className="flex items-center justify-center gap-4">
    {r.status === "PENDING" && (
      <>
        <button
          onClick={() => handleStatusUpdate(r.id, "RESOLVED")}
          className="text-green-600 hover:text-green-800"
          title="Resolve"
        >
          <FaCheckCircle size={18} />
        </button>
        <button
          onClick={() => handleStatusUpdate(r.id, "REJECTED")}
          className="text-yellow-600 hover:text-yellow-800"
          title="Reject"
        >
          <FaTimesCircle size={18} />
        </button>
      </>
    )}
    <button
      onClick={() => handleDelete(r.id)}
      className="text-red-600 hover:text-red-800"
      title="Delete"
    >
      <FaTrashAlt size={18} />
    </button>
  </div>
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DisputeManagement;
