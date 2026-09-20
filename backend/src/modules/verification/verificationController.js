import asyncHandler from "express-async-handler";
import VerificationDocument from "../../models/VerificationDocument.js";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// @desc    Upload & submit verification document
// @route   POST /api/verification/upload
// @access  Private
export const uploadVerificationDocument = asyncHandler(async (req, res) => {
  const { documentType, documentNumber } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a document file");
  }

  const documentUrl = await uploadToCloudinary(req.file.path, "verification_docs");

  const doc = await VerificationDocument.create({
    userId: req.user._id,
    role: req.user.role,
    documentType,
    documentNumber,
    documentUrl,
    status: "pending",
  });

  // Update user status
  await User.findByIdAndUpdate(req.user._id, {
    verificationStatus: "pending",
  });

  // Create admin notification
  const admins = await User.find({ role: "admin" });
  for (const admin of admins) {
    await Notification.create({
      recipientId: admin._id,
      senderId: req.user._id,
      title: "New Verification Document Submitted",
      message: `${req.user.name} (${req.user.role.toUpperCase()}) submitted document ${documentType} for review.`,
      type: "ACCOUNT_VERIFIED",
      entityId: doc._id,
      entityType: "VerificationDocument",
    });
  }

  res.status(201).json(doc);
});

// @desc    Get current user's submitted documents
// @route   GET /api/verification/my-documents
// @access  Private
export const getMyDocuments = asyncHandler(async (req, res) => {
  const docs = await VerificationDocument.find({ userId: req.user._id }).sort("-createdAt");
  res.json(docs);
});
