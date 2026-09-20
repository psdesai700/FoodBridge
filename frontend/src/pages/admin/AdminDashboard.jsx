import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  ShieldCheck,
  Users,
  UtensilsCrossed,
  Heart,
  Truck,
  Award,
  AlertTriangle,
  MapPin,
  Eye,
  BarChart3,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import Sidebar from "../../components/Sidebar";

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [donations, setDonations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("verifications");
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [statsRes, verifRes, usersRes, donRes, compRes] = await Promise.all([
        axios.get("/api/admin/stats", config),
        axios.get("/api/admin/verifications", config),
        axios.get("/api/admin/users", config),
        axios.get("/api/admin/donations", config),
        axios.get("/api/admin/complaints", config),
      ]);

      setStats(statsRes.data);
      setVerifications(verifRes.data);
      setUsersList(usersRes.data);
      setDonations(donRes.data);
      setComplaints(compRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDoc = async (status) => {
    if (!selectedDoc) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `/api/admin/verifications/${selectedDoc._id}/review`,
        { status, adminComment },
        config
      );
      setSelectedDoc(null);
      setAdminComment("");
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspend = async (userId, currentSuspensionState) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(
        `/api/admin/users/${userId}/suspend`,
        {
          isSuspended: !currentSuspensionState,
          suspensionReason: !currentSuspensionState ? "Flagged for manual investigation by Admin" : "",
        },
        config
      );
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: "Mon", kg: 45 },
    { name: "Tue", kg: 60 },
    { name: "Wed", kg: 85 },
    { name: "Thu", kg: 110 },
    { name: "Fri", kg: 140 },
    { name: "Sat", kg: 190 },
    { name: "Sun", kg: 210 },
  ];

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Admin Governance Panel...</div>;
  }

  return (
    <div className="flex min-h-screen bg-bgLight">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Banner */}
        <div className="ngo-card bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Executive Admin Portal
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Platform Governance & Compliance</h1>
            <p className="text-xs text-gray-500">Verify partner credentials, manage user accounts, and track city heatmaps.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              {verifications.length} Pending Approvals
            </span>
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="ngo-card p-5 bg-white border border-emerald-200">
            <span className="text-xs font-bold text-emerald-700">Total Food Saved</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{stats?.totalFoodDonatedKg || 0} kg</div>
            <div className="text-[11px] text-gray-500 mt-1">~{stats?.totalMealsProvided || 0} meals served</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-amber-200">
            <span className="text-xs font-bold text-amber-700">People Fed</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{stats?.totalPeopleServed || 0}</div>
            <div className="text-[11px] text-gray-500 mt-1">Direct headcount proof</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-sky-200">
            <span className="text-xs font-bold text-sky-700">Active Network Partners</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{stats?.totalUsers || 0}</div>
            <div className="text-[11px] text-gray-500 mt-1">
              {stats?.totalRestaurants} Restaurants • {stats?.totalNGOs} NGOs • {stats?.totalVolunteers} Volunteers
            </div>
          </div>

          <div className="ngo-card p-5 bg-white border border-purple-200">
            <span className="text-xs font-bold text-purple-700">Completed Distributions</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{stats?.totalDonationsCompleted || 0}</div>
            <div className="text-[11px] text-gray-500 mt-1">{stats?.activeListings} live listings</div>
          </div>
        </div>

        {/* Analytics Chart (Recharts) */}
        <div className="ngo-card p-6 bg-white border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" /> Weekly Food Surplus Redistribution Trend (kg)
          </h2>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="kg" fill="#16A34A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TAB 1: PENDING VERIFICATIONS */}
        {activeTab === "verifications" && (
          <div className="ngo-card p-6 bg-white border border-gray-200 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">Partner Verification Review Queue</h2>
            {verifications.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No pending verification documents to review.</p>
            ) : (
              <div className="space-y-3">
                {verifications.map((doc) => (
                  <div
                    key={doc._id}
                    className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{doc.userId?.name}</span>
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-purple-100 font-bold text-purple-700">
                          {doc.role}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Doc Category: <strong className="text-gray-900">{doc.documentType}</strong> | Reg No:{" "}
                        <strong className="text-emerald-700">{doc.documentNumber}</strong>
                      </div>
                      <div className="text-gray-400 text-[10px]">Email: {doc.userId?.email} | Phone: {doc.userId?.phone}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={doc.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect File
                      </a>
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                      >
                        Review Decision
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT & SUSPENSION */}
        {activeTab === "users" && (
          <div className="ngo-card p-6 bg-white border border-gray-200 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">User Directory & Status Control</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400">
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{u.name}</td>
                      <td className="py-2.5 px-3 capitalize font-bold text-gray-600">{u.role}</td>
                      <td className="py-2.5 px-3 text-gray-500">{u.address?.city}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {u.isVerified ? "Verified" : u.verificationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-600">★ {u.ratingAvg || "5.0"}</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            u.isSuspended
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                          }`}
                        >
                          {u.isSuspended ? "Reactivate" : "Flag / Suspend"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Decision Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-gray-900 text-sm">Review Verification Document</h3>
              <div className="text-xs text-gray-600">
                User: <strong>{selectedDoc.userId?.name}</strong> ({selectedDoc.role})
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Admin Remark / Reason</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="e.g. FSSAI License verified against official database..."
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleReviewDoc("rejected")}
                  className="flex-1 py-2.5 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs hover:bg-rose-200"
                >
                  Reject Document
                </button>
                <button
                  onClick={() => handleReviewDoc("approved")}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  Approve & Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
