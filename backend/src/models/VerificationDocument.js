import mongoose from "mongoose";

const verificationDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["restaurant", "ngo", "volunteer"],
      required: true,
    },
    documentType: {
      type: String,
      enum: [
        "FSSAI_LICENSE",
        "GST_CERTIFICATE",
        "BUSINESS_REGISTRATION",
        "NGO_REGISTRATION",
        "DARPAN_ID_PROOF",
        "TAX_80G_CERTIFICATE",
        "AADHAAR_ID",
        "DRIVING_LICENSE",
        "OTHER",
      ],
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const VerificationDocument = mongoose.model("VerificationDocument", verificationDocumentSchema);
export default VerificationDocument;
