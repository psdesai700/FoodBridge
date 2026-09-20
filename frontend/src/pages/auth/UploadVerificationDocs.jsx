import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Upload, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import axios from "axios";

export default function UploadVerificationDocs() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [documentType, setDocumentType] = useState("FSSAI_LICENSE");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [myDocs, setMyDocs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user?.token) {
      fetchMyDocs();
      if (user.role === "restaurant") setDocumentType("FSSAI_LICENSE");
      if (user.role === "ngo") setDocumentType("NGO_REGISTRATION");
      if (user.role === "volunteer") setDocumentType("AADHAAR_ID");
    }
  }, [user]);

  const fetchMyDocs = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/verification/my-documents", config);
      setMyDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !documentNumber) {
      setMsg({ type: "error", text: "Please provide document number and select a file." });
      return;
    }

    setIsUploading(true);
    setMsg({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("documentNumber", documentNumber);
      formData.append("document", file);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post("/api/verification/upload", formData, config);
      setMsg({ type: "success", text: "Document uploaded successfully! Admin review in progress." });
      setDocumentNumber("");
      setFile(null);
      fetchMyDocs();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceed = () => {
    if (user.role === "restaurant") navigate("/restaurant");
    else if (user.role === "ngo") navigate("/ngo");
    else if (user.role === "volunteer") navigate("/volunteer");
    else navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-8 space-y-8 bg-bgLight">
      <div className="ngo-card bg-white border border-gray-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Partner Identity Verification & Compliance
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Upload official FSSAI, NGO Trust, or Aadhaar identity documents for Admin review.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 capitalize">
            Role: {user?.role}
          </span>
        </div>

        {/* Verification Status Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            user?.isVerified
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : user?.verificationStatus === "pending"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-gray-50 border-gray-200 text-gray-700"
          }`}
        >
          {user?.isVerified ? (
            <>
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold text-sm">Account Fully Verified!</strong>
                You have full authorization to post, claim, or transport surplus food.
              </div>
            </>
          ) : user?.verificationStatus === "pending" ? (
            <>
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 animate-pulse" />
              <div>
                <strong className="block font-bold text-sm">Document Review Pending</strong>
                Your credentials are in queue for manual verification by the safety team.
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold text-sm">Verification Recommended</strong>
                Please upload your license/ID document to earn your verified badge.
              </div>
            </>
          )}
        </div>

        {msg.text && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold border ${
              msg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Document Category</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:bg-white"
              >
                {user?.role === "restaurant" && (
                  <>
                    <option value="FSSAI_LICENSE">FSSAI Food Safety License</option>
                    <option value="GST_CERTIFICATE">GST Registration Certificate</option>
                    <option value="BUSINESS_REGISTRATION">Business Trade License</option>
                  </>
                )}
                {user?.role === "ngo" && (
                  <>
                    <option value="NGO_REGISTRATION">NGO Trust Registration Certificate</option>
                    <option value="DARPAN_ID_PROOF">NITI Aayog Darpan ID Proof</option>
                    <option value="TAX_80G_CERTIFICATE">80G Income Tax Certificate</option>
                  </>
                )}
                {user?.role === "volunteer" && (
                  <>
                    <option value="AADHAAR_ID">Aadhaar Card ID Proof</option>
                    <option value="DRIVING_LICENSE">Driving License / Voter ID</option>
                  </>
                )}
                <option value="OTHER">Other Official Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Document Registration Number</label>
              <input
                type="text"
                required
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. FSSAI-1122334455"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Upload Document File (PDF / JPG)</label>
            <div className="relative border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-600 font-medium">
                {file ? file.name : "Click to choose document file (Max 10MB)"}
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handleProceed}
              className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
            >
              Skip to Dashboard
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
            >
              {isUploading ? "Uploading..." : "Submit for Verification"}
            </button>
          </div>
        </form>

        {/* Uploaded History */}
        <div className="pt-6 border-t border-gray-100 space-y-3">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Submitted Document History</h3>
          {myDocs.length === 0 ? (
            <p className="text-xs text-gray-400">No documents submitted yet.</p>
          ) : (
            <div className="space-y-2">
              {myDocs.map((doc) => (
                <div key={doc._id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{doc.documentType}</div>
                    <div className="text-[10px] text-gray-500">Reg: {doc.documentNumber}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                      doc.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : doc.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
