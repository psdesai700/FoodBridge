import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "LISTING_POSTED",
        "CLAIM_REQUEST",
        "CLAIM_ACCEPTED",
        "CLAIM_REJECTED",
        "VOLUNTEER_ASSIGNED",
        "PICKUP_READY",
        "OTP_VERIFIED",
        "IN_TRANSIT",
        "DISTRIBUTED",
        "ACCOUNT_VERIFIED",
        "ACCOUNT_REJECTED",
        "RATING_RECEIVED",
      ],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    entityType: {
      type: String,
      enum: ["FoodListing", "Donation", "User", "VerificationDocument"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
