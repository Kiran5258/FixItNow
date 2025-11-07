import React, { useEffect, useState } from "react";
import { CheckCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { getAllDocuments, approveDocument, deleteDocument } from "../../services/api";

function VerifyDocumentsTab() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await getAllDocuments();
        setDocuments(res.data);
      } catch (err) {
        console.error("Error loading docs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveDocument(id);
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, approved: true } : d))
      );
      alert("Provider verified successfully!");
    } catch (err) {
      console.error(err);
      alert("Approval failed");
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  if (loading) return <p>Loading documents...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        Provider Document Verification
      </h2>

      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {documents.map((doc) => (
    <div
      key={doc.id}
      className="border rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 flex flex-col justify-between min-h-[240px]"
    >
      <h3 className="font-semibold text-lg mb-2 break-words">{doc.fileName}</h3>
      <p className="text-sm text-gray-600 mb-1 break-words">
        Provider: {doc.providerName || "Unknown"}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
      </p>
      <a
        href={`http://localhost:8080/${doc.fileUrl.replace(/\\/g, "/")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-sm mb-3 inline-block break-words"
      >
        View Document
      </a>

      <div className="flex justify-between items-center  pt-2 border-t border-gray-200">
        {doc.approved ? (
          <span className="flex items-center text-green-600 font-semibold">
            <CheckCircleIcon className="w-5 h-5 mr-1" />
            Approved
          </span>
        ) : (
          <button
            onClick={() => handleApprove(doc.id)}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Approve
          </button>
        )}

        <TrashIcon
          onClick={() => handleDelete(doc.id)}
          className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
        />
      </div>
    </div>
  ))}
</div>

      
      )}
    </div>
  );
}
export default VerifyDocumentsTab;