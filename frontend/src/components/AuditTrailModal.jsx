import React from "react";
import { X, CheckCircle2, Clock, ShieldCheck, Truck, Users, MapPin, Award, Key, UtensilsCrossed, Heart } from "lucide-react";

export default function AuditTrailModal({ donation, onClose }) {
  if (!donation) return null;

  const timelineSteps = [
    { key: "listed", label: "Listed", desc: "Food Surplus Listed by Restaurant", icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { key: "claimed", label: "Claimed", desc: "Claim Requested by NGO", icon: <Heart className="w-3.5 h-3.5" /> },
    { key: "assigned", label: "Assigned", desc: "Delivery / Transport Assigned", icon: <Truck className="w-3.5 h-3.5" /> },
    { key: "otp_generated", label: "OTP Generated", desc: "4-Digit Pickup OTP Handoff Code Issued", icon: <Key className="w-3.5 h-3.5" /> },
    { key: "picked_up", label: "Picked Up", desc: "OTP Verified at Restaurant", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { key: "in_transit", label: "In Transit", desc: "Live GPS Tracking Active", icon: <MapPin className="w-3.5 h-3.5" /> },
    { key: "distributed", label: "Distributed", desc: "Distribution Headcount & Photo Submitted", icon: <Users className="w-3.5 h-3.5" /> },
    { key: "closed", label: "Closed", desc: "Audit Verified & Metric Logged", icon: <Award className="w-3.5 h-3.5" /> },
  ];

  // Helper to determine if a step in the pipeline has been reached
  const isStepPassed = (stepKey) => {
    if (!donation.auditTrail) return false;
    return donation.auditTrail.some((item) => item.status === stepKey) || donation.status === stepKey;
  };

  const getStepTimestamp = (stepKey) => {
    const found = donation.auditTrail?.find((item) => item.status === stepKey);
    return found ? new Date(found.timestamp).toLocaleString() : null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Donation Audit Trail & Chain of Trust
            </h3>
            <p className="text-xs text-gray-500">Audit Reference: #{donation._id.substring(0, 12)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 overflow-y-auto pr-2 space-y-6 flex-1">
          {/* Metadata Bar */}
          <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Restaurant Donor</span>
              <strong className="text-gray-800 font-semibold">{donation.restaurantId?.name || "Restaurant"}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Recipient NGO</span>
              <strong className="text-gray-800 font-semibold">{donation.ngoId?.name || "NGO"}</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-bold block">Volunteer Transport</span>
              <strong className="text-gray-800 font-semibold">{donation.volunteerId?.name || "Direct Pickup"}</strong>
            </div>
          </div>

          {/* Distribution Proof Card (If completed) */}
          {donation.distributionProof && donation.distributionProof.photoUrl && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" /> Final Distribution Proof
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold">
                  {donation.distributionProof.headcountServed} People Served
                </span>
              </div>
              <img
                src={donation.distributionProof.photoUrl}
                alt="Distribution Proof"
                className="w-full h-44 object-cover rounded-xl border border-emerald-200 shadow-xs"
              />
              <div className="text-xs text-gray-700">
                <strong>Location:</strong> {donation.distributionProof.locationAddress}
              </div>
            </div>
          )}

          {/* Vertical Timeline Stepper */}
          <div className="space-y-4 relative pl-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {timelineSteps.map((step, idx) => {
              const passed = isStepPassed(step.key) || (step.key === "otp_generated" && donation.pickupOtp);
              const timestamp = getStepTimestamp(step.key);

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Circle indicator */}
                  <div
                    className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      passed
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-gray-200 text-gray-500 border border-gray-300"
                    }`}
                  >
                    {passed ? "✓" : idx + 1}
                  </div>

                  {/* Step Card */}
                  <div
                    className={`flex-1 p-3.5 rounded-2xl border text-xs transition-all ${
                      passed
                        ? "bg-white border-gray-200 shadow-xs"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold text-sm ${passed ? "text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                      {timestamp && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-emerald-600" /> {timestamp}
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-xs ${passed ? "text-gray-600" : "text-gray-400"}`}>{step.desc}</p>

                    {step.key === "otp_generated" && donation.pickupOtp && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-mono font-bold text-xs">
                        OTP Code: {donation.pickupOtp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
