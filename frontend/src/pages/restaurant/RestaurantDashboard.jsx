import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Key,
  CheckCircle,
  MessageSquare,
  Eye,
  Award,
  ShieldAlert,
  X,
  Star,
} from "lucide-react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import AuditTrailModal from "../../components/AuditTrailModal";
import ChatModal from "../../components/ChatModal";
import FeedbackModal from "../../components/FeedbackModal";

export default function RestaurantDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [listings, setListings] = useState([]);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");

  // Modal controls
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAuditDonation, setSelectedAuditDonation] = useState(null);
  const [activeChatDonationId, setActiveChatDonationId] = useState(null);
  const [feedbackDonation, setFeedbackDonation] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [foodType, setFoodType] = useState("veg");
  const [quantityKg, setQuantityKg] = useState("20");
  const [estimatedServings, setEstimatedServings] = useState("50");
  const [expiryWindowHours, setExpiryWindowHours] = useState("4");
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    fetchRestaurantData();
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [listRes, histRes] = await Promise.all([
        axios.get("/api/restaurant/my-listings", config),
        axios.get("/api/restaurant/history", config),
      ]);
      setListings(listRes.data);
      setHistory(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        "/api/restaurant/listings",
        {
          title,
          foodType,
          quantityKg,
          estimatedServings,
          expiryWindowHours,
          specialInstructions,
        },
        config
      );
      setShowCreateModal(false);
      setTitle("");
      fetchRestaurantData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleClaimResponse = async (listingId, ngoId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `/api/restaurant/listings/${listingId}/claim-response`,
        { ngoId, action },
        config
      );

      if (action === "accept") {
        alert(`🎉 Claim Accepted! Issued 4-Digit Pickup OTP: ${data.pickupOtp}`);
      }
      fetchRestaurantData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Restaurant Portal...</div>;

  return (
    <div className="flex min-h-screen bg-bgLight">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Banner */}
        <div className="ngo-card bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <UtensilsCrossed className="w-4 h-4" /> Restaurant Surplus Food Portal
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{user?.name}</h1>
            <p className="text-xs text-gray-500">Post excess cooked meals, issue 4-digit pickup OTPs, and serve communities.</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-2xl bg-primaryGreen hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Quick Donate Food
          </button>
        </div>

        {/* Verification Alert Banner */}
        {!user?.isVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <div>
              <strong>FSSAI Safety Verification Pending:</strong> Your account documents are currently under review by Admin. You can create listings, but verification earns your public verified badge.
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="ngo-card p-5 bg-white border border-emerald-200">
            <span className="text-xs font-bold text-emerald-700">Total Food Donated</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{history?.impactStats?.totalFoodDonatedKg || 0} kg</div>
            <div className="text-[11px] text-gray-500 mt-1">Zero food waste footprint</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-amber-200">
            <span className="text-xs font-bold text-amber-700">Active Food Surplus</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{listings.filter((l) => l.status === "available").length}</div>
            <div className="text-[11px] text-gray-500 mt-1">Ready for NGO claims</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-sky-200">
            <span className="text-xs font-bold text-sky-700">Meals Donated</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{history?.impactStats?.totalMealsProvided || 0}</div>
            <div className="text-[11px] text-gray-500 mt-1">Nutritious prepared meals</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-purple-200">
            <span className="text-xs font-bold text-purple-700">Donor Rating Score</span>
            <div className="text-2xl font-black text-gray-900 mt-1">★ {user?.ratingAvg || "5.0"} / 5.0</div>
            <div className="text-[11px] text-gray-500 mt-1">FSSAI Certified Partner</div>
          </div>
        </div>

        {/* Food Listings Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-emerald-600" /> Active Food Surplus Listings ({listings.length})
          </h2>

          {listings.length === 0 ? (
            <div className="ngo-card p-10 text-center rounded-3xl bg-white space-y-3">
              <p className="text-gray-400 text-xs">No active food surplus listings created yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-primaryGreen text-white font-bold text-xs"
              >
                Post First Food Listing
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <div
                  key={l._id}
                  className="ngo-card p-5 bg-white space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <img
                      src={l.photos?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"}
                      alt={l.title}
                      className="w-full h-36 object-cover rounded-2xl border border-gray-100 shadow-xs"
                    />

                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {l.foodType}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize bg-gray-100 text-gray-700">
                        {l.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{l.title}</h3>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">Quantity</span>
                        <strong className="text-gray-800">{l.quantityKg} kg ({l.estimatedServings} meals)</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-gray-400 block text-[10px] font-bold">Expiry Window</span>
                        <strong className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> {l.expiryWindowHours} Hours
                        </strong>
                      </div>
                    </div>

                    {/* Issued OTP Badge */}
                    {l.otpCode && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                        <span className="text-amber-800 font-semibold flex items-center gap-1">
                          <Key className="w-4 h-4 text-amber-600" /> Pickup OTP:
                        </span>
                        <span className="font-mono font-black text-lg text-amber-700">{l.otpCode}</span>
                      </div>
                    )}

                    {/* NGO Claim Requests */}
                    {l.claims && l.claims.length > 0 && l.status === "claimed" && (
                      <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                        <span className="font-bold text-gray-800 block text-[11px]">Pending NGO Claim Request:</span>
                        {l.claims.map((claim, idx) => (
                          <div key={idx} className="flex items-center justify-between pt-1 border-t border-gray-200">
                            <div>
                              <div className="font-bold text-gray-900">{claim.ngoId?.name}</div>
                              <span className="text-[10px] text-gray-500">
                                {claim.requestedVolunteer ? "Requested Volunteer Delivery" : "Direct Pickup"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleClaimResponse(l._id, claim.ngoId?._id, "accept")}
                                className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-xs"
                              >
                                Accept & Issue OTP
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Posted: {new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>{l.pickupAddress?.city}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Donations Table */}
        {history?.donations && history.donations.length > 0 && (
          <div className="ngo-card p-6 bg-white border border-gray-200 space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Recent Surplus Donations & History</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400">
                    <th className="py-2.5 px-3">Food Item</th>
                    <th className="py-2.5 px-3">Recipient NGO</th>
                    <th className="py-2.5 px-3">Pickup OTP</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.donations.map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{d.listingId?.title}</td>
                      <td className="py-2.5 px-3 text-gray-700">{d.ngoId?.name}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{d.pickupOtp}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600 capitalize">{d.status}</td>
                      <td className="py-2.5 px-3 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveChatDonationId(d._id)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                          title="Open Coordination Chat"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setFeedbackDonation(d)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                          title="Rate NGO / Volunteer"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedAuditDonation(d)}
                          className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 border border-emerald-200"
                        >
                          Audit Timeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Donate Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-600" /> Post Surplus Food Listing
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Listing Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 60 Servings Fresh Veg Biryani & Paneer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Food Category</label>
                    <select
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="bakery">Bakery & Pastries</option>
                      <option value="cooked-meals">Cooked Meals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantityKg}
                      onChange={(e) => setQuantityKg(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Meals</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={estimatedServings}
                      onChange={(e) => setEstimatedServings(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Expiry Window (Hours)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={24}
                      value={expiryWindowHours}
                      onChange={(e) => setExpiryWindowHours(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Special Packaging Notes</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Thermal container details, handling advice..."
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  Publish Food Surplus Listing
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modals */}
        {selectedAuditDonation && (
          <AuditTrailModal donation={selectedAuditDonation} onClose={() => setSelectedAuditDonation(null)} />
        )}
        {activeChatDonationId && (
          <ChatModal donationId={activeChatDonationId} onClose={() => setActiveChatDonationId(null)} />
        )}
        {feedbackDonation && (
          <FeedbackModal
            donation={feedbackDonation}
            toUserId={feedbackDonation.ngoId?._id}
            toUserName={feedbackDonation.ngoId?.name}
            onClose={() => setFeedbackDonation(null)}
          />
        )}
      </main>
    </div>
  );
}
