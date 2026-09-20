import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Heart,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Truck,
  Users,
  Camera,
  MessageSquare,
  X,
  Star,
} from "lucide-react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import AuditTrailModal from "../../components/AuditTrailModal";
import ChatModal from "../../components/ChatModal";
import FeedbackModal from "../../components/FeedbackModal";

export default function NgoDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [availableListings, setAvailableListings] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");

  // Filter state
  const [foodType, setFoodType] = useState("all");
  const [cityFilter, setCityFilter] = useState("Mumbai");

  // Modals
  const [claimingListing, setClaimingListing] = useState(null);
  const [requestedVolunteer, setRequestedVolunteer] = useState(true);
  const [otpVerifyDonation, setOtpVerifyDonation] = useState(null);
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [proofDonation, setProofDonation] = useState(null);
  const [headcountServed, setHeadcountServed] = useState("50");
  const [locationAddress, setLocationAddress] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [proofPhotoFile, setProofPhotoFile] = useState(null);

  const [selectedAuditDonation, setSelectedAuditDonation] = useState(null);
  const [activeChatDonationId, setActiveChatDonationId] = useState(null);
  const [feedbackDonation, setFeedbackDonation] = useState(null);

  useEffect(() => {
    fetchNgoData();
  }, [user, foodType, cityFilter]);

  const fetchNgoData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [listRes, myDonRes] = await Promise.all([
        axios.get(`/api/ngo/listings?foodType=${foodType}&city=${cityFilter}`, config),
        axios.get("/api/ngo/my-donations", config),
      ]);
      setAvailableListings(listRes.data);
      setMyDonations(myDonRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async () => {
    if (!claimingListing) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `/api/ngo/listings/${claimingListing._id}/claim`,
        { requestedVolunteer },
        config
      );
      alert("🎉 Claim request submitted to restaurant owner!");
      setClaimingListing(null);
      fetchNgoData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleVerifyOtpDirect = async (e) => {
    e.preventDefault();
    if (!otpVerifyDonation) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `/api/ngo/donations/${otpVerifyDonation._id}/verify-otp`,
        { otp: otpCodeInput },
        config
      );
      alert("✅ Pickup OTP Verified! Status updated to Picked Up.");
      setOtpVerifyDonation(null);
      setOtpCodeInput("");
      fetchNgoData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofDonation) return;

    try {
      const formData = new FormData();
      formData.append("headcountServed", headcountServed);
      formData.append("locationAddress", locationAddress || user.address?.city || "Community Center");
      formData.append("notes", proofNotes);
      if (proofPhotoFile) {
        formData.append("proofPhoto", proofPhotoFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post(`/api/ngo/donations/${proofDonation._id}/distribution-proof`, formData, config);
      alert("🎉 Distribution proof submitted & donation audit closed!");
      setProofDonation(null);
      fetchNgoData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading NGO Portal...</div>;

  return (
    <div className="flex min-h-screen bg-bgLight">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Banner */}
        <div className="ngo-card bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4" /> NGO Food Redistribution Hub
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{user?.name}</h1>
            <p className="text-xs text-gray-500">Browse nearby surplus food, claim listings, and upload headcount distribution proof.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
              {user?.impactStats?.peopleServed || 0} People Fed
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="ngo-card p-5 bg-white border border-emerald-200">
            <span className="text-xs font-bold text-emerald-700">Available Listings Nearby</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{availableListings.length}</div>
            <div className="text-[11px] text-gray-500 mt-1">Ready to claim</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-amber-200">
            <span className="text-xs font-bold text-amber-700">Active NGO Claims</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{myDonations.length}</div>
            <div className="text-[11px] text-gray-500 mt-1">Direct & Volunteer delivery</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-sky-200">
            <span className="text-xs font-bold text-sky-700">Total Food Distributed</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{user?.impactStats?.totalFoodDonatedKg || 0} kg</div>
            <div className="text-[11px] text-gray-500 mt-1">Zero waste redistribution</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-purple-200">
            <span className="text-xs font-bold text-purple-700">NGO Trust Rating</span>
            <div className="text-2xl font-black text-gray-900 mt-1">★ {user?.ratingAvg || "4.9"} / 5.0</div>
            <div className="text-[11px] text-gray-500 mt-1">Verified Darpan Partner</div>
          </div>
        </div>

        {/* Available Food Listings Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-600" /> Browse Available Surplus Food Cards ({availableListings.length})
            </h2>

            {/* Filter inputs */}
            <div className="flex items-center gap-2">
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800"
              >
                <option value="all">All Food Types</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="bakery">Bakery Items</option>
                <option value="cooked-meals">Cooked Meals</option>
              </select>

              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="City filter"
                className="w-28 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800"
              />
            </div>
          </div>

          {availableListings.length === 0 ? (
            <div className="ngo-card p-10 text-center rounded-3xl bg-white text-gray-400 text-xs">
              No surplus food listings available matching your filters right now.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableListings.map((l) => (
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
                      <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Expires in {l.expiryWindowHours}h
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{l.title}</h3>
                    <p className="text-xs text-gray-500">Restaurant: <strong className="text-gray-900">{l.restaurantId?.name}</strong></p>

                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                      <div>Quantity: <strong className="text-emerald-700">{l.quantityKg} kg</strong> (~{l.estimatedServings} meals)</div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {l.pickupAddress?.street}, {l.pickupAddress?.city}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setClaimingListing(l)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Claim Food Surplus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claimed NGO History */}
        <div className="ngo-card p-6 bg-white border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Active NGO Claimed Donations ({myDonations.length})
          </h2>

          {myDonations.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No active claimed donations yet.</p>
          ) : (
            <div className="space-y-3">
              {myDonations.map((d) => (
                <div
                  key={d._id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{d.listingId?.title}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {d.status}
                      </span>
                    </div>

                    <div className="text-gray-600">
                      Restaurant: <strong>{d.restaurantId?.name}</strong> | Transport:{" "}
                      <strong>{d.pickupType === "volunteer_delivery" ? "🛵 Volunteer Delivery" : "🏢 Direct Pickup"}</strong>
                    </div>

                    <div className="text-[11px] text-amber-700 font-mono font-bold">
                      Pickup OTP Code: {d.pickupOtp}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveChatDonationId(d._id)}
                      className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                      title="Open Coordination Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setFeedbackDonation(d)}
                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                      title="Rate Partner"
                    >
                      <Star className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSelectedAuditDonation(d)}
                      className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-bold"
                    >
                      Audit Trail
                    </button>

                    {d.pickupType === "direct_ngo" && d.status === "assigned" && (
                      <button
                        onClick={() => setOtpVerifyDonation(d)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                      >
                        Enter Pickup OTP
                      </button>
                    )}

                    {["picked_up", "in_transit", "distributed"].includes(d.status) && (
                      <button
                        onClick={() => setProofDonation(d)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                      >
                        <Camera className="w-4 h-4" /> Submit Proof
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claim Modal */}
        {claimingListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-gray-900 text-sm">Claim Surplus Food</h3>
              <p className="text-xs text-gray-600">
                Claiming <strong>{claimingListing.title}</strong> ({claimingListing.quantityKg}kg)
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <label className="block font-bold text-gray-800">Transport Option</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      checked={requestedVolunteer === true}
                      onChange={() => setRequestedVolunteer(true)}
                    />
                    <span>Request Volunteer Delivery (Network Transport)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                    <input
                      type="radio"
                      checked={requestedVolunteer === false}
                      onChange={() => setRequestedVolunteer(false)}
                    />
                    <span>Direct NGO Pickup (We will collect directly)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setClaimingListing(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaimSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  Submit Claim Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Direct OTP Verification Modal */}
        {otpVerifyDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-gray-900 text-sm">Enter Restaurant Pickup OTP</h3>
              <p className="text-xs text-gray-500">Request the 4-digit OTP code from restaurant staff.</p>

              <input
                type="text"
                maxLength={4}
                value={otpCodeInput}
                onChange={(e) => setOtpCodeInput(e.target.value)}
                placeholder="e.g. 4829"
                className="w-full text-center text-2xl font-mono tracking-widest p-3 rounded-xl bg-gray-50 border border-gray-200 text-amber-700 font-bold"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOtpVerifyDonation(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtpDirect}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proof Submission Modal */}
        {proofDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" /> Submit Distribution Proof & Headcount
                </h3>
                <button onClick={() => setProofDonation(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Headcount Fed (Number of people)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={headcountServed}
                    onChange={(e) => setHeadcountServed(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Distribution Location Address</label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Dharavi Community Shelter, Mumbai"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Upload Proof Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofPhotoFile(e.target.files[0])}
                    className="w-full p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Feedback / Notes</label>
                  <textarea
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Distributed fresh warm meals to elderly residents..."
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Confirm Final Distribution & Close Audit Loop
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
            toUserId={feedbackDonation.restaurantId?._id}
            toUserName={feedbackDonation.restaurantId?.name}
            onClose={() => setFeedbackDonation(null)}
          />
        )}
      </main>
    </div>
  );
}
