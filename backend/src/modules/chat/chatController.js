import asyncHandler from "express-async-handler";
import Message from "../../models/Message.js";
import Notification from "../../models/Notification.js";
import Rating from "../../models/Rating.js";
import User from "../../models/User.js";
import Donation from "../../models/Donation.js";

// Helper to check if a user is a participant of a donation
const checkDonationParticipant = (donation, userId, userRole) => {
  if (userRole === "admin") return true;
  const isRestaurant = donation.restaurantId && donation.restaurantId.toString() === userId.toString();
  const isNgo = donation.ngoId && donation.ngoId.toString() === userId.toString();
  const isVolunteer = donation.volunteerId && donation.volunteerId.toString() === userId.toString();
  return isRestaurant || isNgo || isVolunteer;
};

// @desc    Get chat message thread for a donation
// @route   GET /api/chat/donation/:donationId
// @access  Private
export const getDonationMessages = asyncHandler(async (req, res) => {
  const { donationId } = req.params;
  const donation = await Donation.findById(donationId);

  if (!donation) {
    res.status(404);
    throw new Error("Donation record not found");
  }

  if (!checkDonationParticipant(donation, req.user._id, req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to access chat messages for this donation");
  }

  const messages = await Message.find({ donationId }).sort("createdAt");
  res.json(messages);
});

// @desc    Post a new chat message in donation thread
// @route   POST /api/chat/donation/:donationId
// @access  Private
export const sendDonationMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { donationId } = req.params;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Message text cannot be empty");
  }

  const donation = await Donation.findById(donationId);

  if (!donation) {
    res.status(404);
    throw new Error("Donation record not found");
  }

  if (!checkDonationParticipant(donation, req.user._id, req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to send messages in this donation chat");
  }

  const message = await Message.create({
    donationId,
    senderId: req.user._id,
    senderName: req.user.name,
    senderRole: req.user.role,
    text: text.trim(),
  });

  res.status(201).json(message);
});

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientId: req.user._id }).sort("-createdAt").limit(30);
  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (notification && notification.recipientId.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } else {
    res.status(404);
    throw new Error("Notification not found");
  }
});

// @desc    Submit rating & feedback
// @route   POST /api/ratings
// @access  Private
export const submitRating = asyncHandler(async (req, res) => {
  const { toUserId, donationId, score, feedback, category } = req.body;

  if (!toUserId || !donationId || !score) {
    res.status(400);
    throw new Error("Please provide toUserId, donationId, and score");
  }

  if (req.user._id.toString() === toUserId.toString()) {
    res.status(400);
    throw new Error("You cannot submit a rating for yourself");
  }

  const donation = await Donation.findById(donationId);
  if (!donation) {
    res.status(404);
    throw new Error("Donation record not found");
  }

  // BUG-005 Fix: Verify caller and recipient are both participants in the donation
  if (!checkDonationParticipant(donation, req.user._id, req.user.role)) {
    res.status(403);
    throw new Error("Not authorized to rate participants of this donation");
  }

  if (!checkDonationParticipant(donation, toUserId, "user")) {
    res.status(400);
    throw new Error("Target user was not a participant in this donation");
  }

  const existingRating = await Rating.findOne({
    fromUserId: req.user._id,
    toUserId,
    donationId,
  });

  if (existingRating) {
    res.status(400);
    throw new Error("You have already submitted a rating for this donation");
  }

  const rating = await Rating.create({
    fromUserId: req.user._id,
    toUserId,
    donationId,
    score: Number(score),
    feedback: feedback || "",
    category: category || "overall",
  });

  // Recalculate average rating for target user
  const userRatings = await Rating.find({ toUserId });
  const avgScore = userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length;

  await User.findByIdAndUpdate(toUserId, {
    ratingAvg: Math.round(avgScore * 10) / 10,
    ratingCount: userRatings.length,
  });

  // Mark rating submitted in donation record
  if (req.user.role === "restaurant") donation.ratings.restaurantRatingSubmitted = true;
  if (req.user.role === "ngo") donation.ratings.ngoRatingSubmitted = true;
  if (req.user.role === "volunteer") donation.ratings.volunteerRatingSubmitted = true;
  await donation.save();

  res.status(201).json(rating);
});
