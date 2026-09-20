import asyncHandler from "express-async-handler";
import User from "../../models/User.js";
import VerificationDocument from "../../models/VerificationDocument.js";
import FoodListing from "../../models/FoodListing.js";
import Donation from "../../models/Donation.js";
import Rating from "../../models/Rating.js";
import Notification from "../../models/Notification.js";

// @desc    Get admin dashboard stats & platform analytics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalRestaurants = await User.countDocuments({ role: "restaurant" });
  const totalNGOs = await User.countDocuments({ role: "ngo" });
  const totalVolunteers = await User.countDocuments({ role: "volunteer" });
  const pendingVerificationsCount = await User.countDocuments({ verificationStatus: "pending" });

  const totalListings = await FoodListing.countDocuments();
  const activeListings = await FoodListing.countDocuments({ status: "available" });

  const completedDonations = await Donation.find({ status: { $in: ["distributed", "closed"] } }).populate("listingId");
  
  // BUG-010 Fix: Calculate total food saved from quantityKg
  const totalFoodSavedKg = completedDonations.reduce(
    (acc, curr) => acc + (curr.quantityKg || curr.listingId?.quantityKg || 0),
    0
  );
  const totalPeopleServed = completedDonations.reduce(
    (acc, curr) => acc + (curr.distributionProof?.headcountServed || 0),
    0
  );
  // 1 kg = ~4 meals estimate
  const totalMealsProvided = totalFoodSavedKg * 4;

  // BUG-013 Fix: City-wise heatmap aggregation normalized by city name
  const cityHeatmap = await Donation.aggregate([
    { $match: { status: { $in: ["distributed", "closed"] } } },
    {
      $lookup: {
        from: "foodlistings",
        localField: "listingId",
        foreignField: "_id",
        as: "listing",
      },
    },
    { $unwind: { path: "$listing", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: {
          $ifNull: ["$listing.pickupAddress.city", "$distributionProof.locationAddress"],
        },
        donationsCount: { $sum: 1 },
        totalFoodSavedKg: { $sum: { $ifNull: ["$quantityKg", "$listing.quantityKg"] } },
        peopleServed: { $sum: "$distributionProof.headcountServed" },
        lat: { $first: "$distributionProof.coordinates.lat" },
        lng: { $first: "$distributionProof.coordinates.lng" },
      },
    },
  ]);

  res.json({
    totalUsers,
    totalRestaurants,
    totalNGOs,
    totalVolunteers,
    pendingVerificationsCount,
    totalListings,
    activeListings,
    totalDonationsCompleted: completedDonations.length,
    totalFoodSavedKg,
    totalMealsProvided,
    totalPeopleServed,
    cityHeatmap,
  });
});

// @desc    Get pending verification documents list
// @route   GET /api/admin/verifications
// @access  Private/Admin
export const getPendingVerifications = asyncHandler(async (req, res) => {
  const docs = await VerificationDocument.find({ status: "pending" })
    .populate("userId", "name email phone role verificationStatus profileDetails address")
    .sort("-createdAt");
  res.json(docs);
});

// @desc    Review & approve/reject a user's verification document
// @route   PUT /api/admin/verifications/:id/review
// @access  Private/Admin
export const reviewVerificationDocument = asyncHandler(async (req, res) => {
  const { status, adminComment } = req.body; // status: "approved" | "rejected"
  const doc = await VerificationDocument.findById(req.params.id).populate("userId");

  if (!doc) {
    res.status(404);
    throw new Error("Verification document not found");
  }

  doc.status = status;
  doc.adminComment = adminComment || "";
  doc.reviewedBy = req.user._id;
  doc.reviewedAt = Date.now();
  await doc.save();

  const targetUser = doc.userId;
  if (targetUser) {
    if (status === "approved") {
      targetUser.isVerified = true;
      targetUser.verificationStatus = "approved";
      targetUser.rejectionReason = "";
    } else {
      targetUser.isVerified = false;
      targetUser.verificationStatus = "rejected";
      targetUser.rejectionReason = adminComment || "Document review rejected";
    }
    await targetUser.save();

    // Create notification
    await Notification.create({
      recipientId: targetUser._id,
      senderId: req.user._id,
      title: status === "approved" ? "🎉 Account Verified!" : "⚠️ Verification Rejected",
      message:
        status === "approved"
          ? "Your verification documents have been approved by Admin. You now have full access to FoodBridge features!"
          : `Your document verification was rejected: ${adminComment || "Please re-upload valid documents."}`,
      type: status === "approved" ? "ACCOUNT_VERIFIED" : "ACCOUNT_REJECTED",
      entityId: doc._id,
      entityType: "VerificationDocument",
    });
  }

  res.json({ message: `Document ${status} successfully`, doc, user: targetUser });
});

// @desc    Get all users (with filtering)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isVerified } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isVerified !== undefined) filter.isVerified = isVerified === "true";

  const users = await User.find(filter).sort("-createdAt");
  res.json(users);
});

// @desc    Toggle user suspension (flag suspicious activity)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
export const toggleUserSuspension = asyncHandler(async (req, res) => {
  const { isSuspended, suspensionReason } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // BUG-011 Fix: Block suspension if target user is an Admin
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Admin accounts cannot be suspended");
  }

  user.isSuspended = isSuspended;
  user.suspensionReason = isSuspended ? suspensionReason || "Suspicious behavior flagged by admin" : "";
  await user.save();

  res.json({ message: `User ${isSuspended ? "suspended" : "reactivated"} successfully`, user });
});

// @desc    Get all donations across pipeline for admin monitoring
// @route   GET /api/admin/donations
// @access  Private/Admin
export const getAllDonationsPipeline = asyncHandler(async (req, res) => {
  const donations = await Donation.find()
    .populate("listingId")
    .populate("restaurantId", "name email phone address ratingAvg")
    .populate("ngoId", "name email phone address ratingAvg")
    .populate("volunteerId", "name email phone address ratingAvg profileDetails")
    .sort("-createdAt");
  res.json(donations);
});

// @desc    Get low ratings & complaints for audit
// @route   GET /api/admin/complaints
// @access  Private/Admin
export const getComplaintsAudit = asyncHandler(async (req, res) => {
  const ratings = await Rating.find({ score: { $lte: 2 } })
    .populate("fromUserId", "name role email")
    .populate("toUserId", "name role email")
    .populate("donationId")
    .sort("-createdAt");
  res.json(ratings);
});
