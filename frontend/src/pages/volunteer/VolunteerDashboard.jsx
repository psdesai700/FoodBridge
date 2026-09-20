import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Truck,
  MapPin,
  Clock,
  Key,
  Navigation,
  CheckCircle,
  MessageSquare,
  Award,
  ShieldCheck,
  Camera,
  X,
  Play,
  Star,
} from "lucide-react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import LiveTrackingMap from "../../components/LiveTrackingMap";
import AuditTrailModal from "../../components/AuditTrailModal";
import ChatModal from "../../components/ChatModal";
import FeedbackModal from "../../components/FeedbackModal";
import { getSocket } from "../../services/socket";

export default function VolunteerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("open-tasks");

  // Modals & Active Task state
  const [otpVerifyTask, setOtpVerifyTask] = useState(null);
  const [otpCodeInput, setOtpCodeInput] = useState("");
  const [proofTask, setProofTask] = useState(null);
  const [headcountServed, setHeadcountServed] = useState("40");
  const [locationAddress, setLocationAddress] = useState("");
  const [proofNotes, setProofNotes] = useState("");

  const [selectedAuditDonation, setSelectedAuditDonation] = useState(null);
  const [activeChatDonationId, setActiveChatDonationId] = useState(null);
  const [feedbackDonation, setFeedbackDonation] = useState(null);

  // Live GPS simulation state
  const [simulatingTaskId, setSimulatingTaskId] = useState(null);
  const [simCoords, setSimCoords] = useState({ lat: 18.922, lng: 72.8336 });

  useEffect(() => {
    fetchVolunteerData();
  }, [user]);

  const fetchVolunteerData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [availRes, myRes] = await Promise.all([
        axios.get("/api/volunteer/available-tasks", config),
        axios.get("/api/volunteer/my-tasks", config),
      ]);
      setAvailableTasks(availRes.data);
      setMyTasks(myRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`/api/volunteer/tasks/${taskId}/accept`, {}, config);
      alert("🛵 Delivery task accepted! Head to restaurant for pickup.");
      fetchVolunteerData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleVerifyOtpVolunteer = async (e) => {
    e.preventDefault();
    if (!otpVerifyTask) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `/api/volunteer/tasks/${otpVerifyTask._id}/verify-otp`,
        { otp: otpCodeInput },
        config
      );
      alert("✅ Pickup OTP verified! Status updated to In-Transit.");
      setOtpVerifyTask(null);
      setOtpCodeInput("");
      fetchVolunteerData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleSimulateGPSMovement = (task) => {
    setSimulatingTaskId(task._id);
    const socket = getSocket();

    let step = 0;
    const path = [
      { lat: task.restaurantId?.address?.coordinates?.lat || 18.922, lng: task.restaurantId?.address?.coordinates?.lng || 72.8336 },
      { lat: 18.950, lng: 72.840 },
      { lat: 19.010, lng: 72.845 },
      { lat: task.ngoId?.address?.coordinates?.lat || 19.0402, lng: task.ngoId?.address?.coordinates?.lng || 72.8508 },
    ];

    const timer = setInterval(() => {
      if (step < path.length) {
        const nextCoord = path[step];
        setSimCoords(nextCoord);
        if (socket) {
          socket.emit("update_location", {
            donationId: task._id,
            lat: nextCoord.lat,
            lng: nextCoord.lng,
            volunteerId: user._id,
          });
        }
        step++;
      } else {
        clearInterval(timer);
        setSimulatingTaskId(null);
        alert("📍 Live GPS simulation complete! Reached drop-off destination.");
      }
    }, 2500);
  };

  const handleCompleteDelivery = async (e) => {
    e.preventDefault();
    if (!proofTask) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(
        `/api/volunteer/tasks/${proofTask._id}/complete-delivery`,
        {
          headcountServed,
          locationAddress: locationAddress || proofTask.ngoId?.address?.city || "Dropoff Point",
          notes: proofNotes,
        },
        config
      );
      alert("🎉 Delivery completed & distribution proof submitted!");
      setProofTask(null);
      fetchVolunteerData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Volunteer Fleet...</div>;

  return (
    <div className="flex min-h-screen bg-bgLight">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Banner */}
        <div className="ngo-card bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase tracking-wider">
              <Truck className="w-4 h-4" /> Volunteer Fleet Command
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{user?.name}</h1>
            <p className="text-xs text-gray-500">Accept delivery tasks, verify pickup OTPs, and broadcast live GPS location.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200">
              {user?.impactStats?.deliveriesCompleted || 0} Deliveries Completed
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="ngo-card p-5 bg-white border border-sky-200">
            <span className="text-xs font-bold text-sky-700">Open Delivery Tasks</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{availableTasks.length}</div>
            <div className="text-[11px] text-gray-500 mt-1">Ready to accept</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-emerald-200">
            <span className="text-xs font-bold text-emerald-700">Deliveries Completed</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{user?.impactStats?.deliveriesCompleted || 0}</div>
            <div className="text-[11px] text-gray-500 mt-1">OTP Handshake verified</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-amber-200">
            <span className="text-xs font-bold text-amber-700">Meals Transported</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{user?.impactStats?.totalMealsProvided || 0}</div>
            <div className="text-[11px] text-gray-500 mt-1">Nutritious meals delivered</div>
          </div>

          <div className="ngo-card p-5 bg-white border border-purple-200">
            <span className="text-xs font-bold text-purple-700">Volunteer Rating</span>
            <div className="text-2xl font-black text-gray-900 mt-1">★ {user?.ratingAvg || "5.0"} / 5.0</div>
            <div className="text-[11px] text-gray-500 mt-1">Vehicle: {user?.profileDetails?.vehicleType || "Scooter"}</div>
          </div>
        </div>

        {/* Available Tasks */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" /> Open Task Board ({availableTasks.length})
          </h2>

          {availableTasks.length === 0 ? (
            <div className="ngo-card p-8 text-center bg-white text-gray-400 text-xs">
              No open delivery tasks available right now.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTasks.map((t) => (
                <div key={t._id} className="ngo-card p-5 bg-white space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800">
                        Delivery Request
                      </span>
                      <span className="text-xs font-bold text-emerald-700">{t.listingId?.quantityKg} kg</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{t.listingId?.title}</h3>

                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                      <div>Pickup: <strong className="text-gray-900">{t.restaurantId?.name}</strong></div>
                      <div>Dropoff: <strong className="text-gray-900">{t.ngoId?.name}</strong></div>
                      <div className="text-gray-500 flex items-center gap-1 text-[10px]">
                        <MapPin className="w-3 h-3 text-emerald-600" /> {t.restaurantId?.address?.city}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptTask(t._id)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Accept Delivery Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accepted Delivery Tasks & Live Tracking */}
        <div className="ngo-card p-6 bg-white border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" /> My Active Deliveries & GPS Tracking Hub ({myTasks.length})
          </h2>

          {myTasks.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">You have no active accepted deliveries.</p>
          ) : (
            <div className="space-y-6">
              {myTasks.map((t) => (
                <div key={t._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{t.listingId?.title}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                          {t.status}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        Restaurant: <strong>{t.restaurantId?.name}</strong> → NGO: <strong>{t.ngoId?.name}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setActiveChatDonationId(t._id)}
                        className="p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
                        title="Open Coordination Chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setFeedbackDonation(t)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                        title="Rate Restaurant / NGO"
                      >
                        <Star className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedAuditDonation(t)}
                        className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-bold"
                      >
                        Audit Trail
                      </button>

                      {t.status === "assigned" && (
                        <button
                          onClick={() => setOtpVerifyTask(t)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                        >
                          Enter Pickup OTP
                        </button>
                      )}

                      {t.status === "in_transit" && (
                        <button
                          onClick={() => handleSimulateGPSMovement(t)}
                          disabled={simulatingTaskId === t._id}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-600 text-white font-bold flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" /> {simulatingTaskId === t._id ? "Simulating..." : "Simulate Live GPS"}
                        </button>
                      )}

                      {t.status === "in_transit" && (
                        <button
                          onClick={() => setProofTask(t)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" /> Submit Proof
                        </button>
                      )}
                    </div>
                  </div>

                  {t.status === "in_transit" && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-gray-700 block mb-2">Live GPS Delivery Tracking:</span>
                      <LiveTrackingMap
                        restaurantCoords={t.restaurantId?.address?.coordinates}
                        volunteerCoords={simCoords}
                        ngoCoords={t.ngoId?.address?.coordinates}
                        historyPoints={t.deliveryGpsHistory}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verify OTP Modal */}
        {otpVerifyTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-gray-900 text-sm">Verify Restaurant Pickup OTP</h3>
              <p className="text-xs text-gray-500">Request the 4-digit code from restaurant staff.</p>

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
                  onClick={() => setOtpVerifyTask(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtpVolunteer}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Verify & Pickup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Proof Modal */}
        {proofTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600" /> Submit Delivery Completion Proof
                </h3>
                <button onClick={() => setProofTask(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCompleteDelivery} className="space-y-4">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Dropoff Address</label>
                  <input
                    type="text"
                    required
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="e.g. Dharavi Community Center, Mumbai"
                    className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Notes</label>
                  <textarea
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Delivered safely in thermal containers..."
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800"
                    rows={2}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Complete Delivery & Close Audit Loop
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
