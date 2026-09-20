import mongoose from "mongoose";

const auditStepSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["listed", "claimed", "assigned", "picked_up", "in_transit", "distributed", "closed", "cancelled"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedByRole: {
    type: String,
  },
  notes: {
    type: String,
    default: "",
  },
  location: {
    lat: Number,
    lng: Number,
    address: String,
  },
});

const gpsPointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const donationSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodListing",
      required: true,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pickupType: {
      type: String,
      enum: ["direct_ngo", "volunteer_delivery"],
      default: "volunteer_delivery",
    },
    quantityKg: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["listed", "claimed", "assigned", "picked_up", "in_transit", "distributed", "closed", "cancelled"],
      default: "claimed",
    },
    pickupOtp: {
      type: String,
      required: true,
    },
    otpVerifiedAt: {
      type: Date,
    },
    pickupPhotoUrl: {
      type: String,
      default: "",
    },
    deliveryGpsHistory: [gpsPointSchema],
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    distributionProof: {
      photoUrl: { type: String, default: "" },
      headcountServed: { type: Number, default: 0 },
      locationAddress: { type: String, default: "" },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      notes: { type: String, default: "" },
      verifiedAt: { type: Date },
    },
    ratings: {
      restaurantRatingSubmitted: { type: Boolean, default: false },
      ngoRatingSubmitted: { type: Boolean, default: false },
      volunteerRatingSubmitted: { type: Boolean, default: false },
    },
    auditTrail: [auditStepSchema],
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
