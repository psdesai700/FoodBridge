import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  requestedVolunteer: {
    type: Boolean,
    default: true, // If true, requests volunteer delivery. If false, direct NGO pickup
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
});

const foodListingSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
    },
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "vegan", "bakery", "cooked-meals", "packaged"],
      required: true,
    },
    quantityKg: {
      type: Number,
      required: true,
      min: 1,
    },
    estimatedServings: {
      type: Number,
      required: true,
      min: 1,
    },
    prepTime: {
      type: Date,
      default: Date.now,
    },
    expiryWindowHours: {
      type: Number,
      required: true, // Hours from prep time
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    pickupAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: "Maharashtra" },
      zipcode: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    photos: [
      {
        type: String,
      },
    ],
    specialInstructions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["available", "claimed", "assigned", "picked_up", "in_transit", "distributed", "cancelled", "expired"],
      default: "available",
    },
    claims: [claimSchema],
    activeNGOId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    activeVolunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    otpCode: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const FoodListing = mongoose.model("FoodListing", foodListingSchema);
export default FoodListing;
