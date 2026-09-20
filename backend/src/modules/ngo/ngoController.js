import asyncHandler from "express-async-handler";
import FoodListing from "../../models/FoodListing.js";
import Donation from "../../models/Donation.js";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// @desc    Browse & filter available food listings
// @route   GET /api/ngo/listings
// @access  Private/NGO
export const getAvailableListings = asyncHandler(async (req, res) => {
  const { foodType, city, maxDistance } = req.query;

  const query = {
    status: "available",
    expiresAt: { $gt: new Date() },
  };

  if (foodType && foodType !== "all") {
    query.foodType = foodType;
  }

  if (city) {
    query["pickupAddress.city"] = new RegExp(city, "i");
  }

  const listings = await FoodListing.find(query)
    .populate("restaurantId", "name email phone ratingAvg address profileDetails")
    .sort("-createdAt");

  res.json(listings);
});

// @desc    Claim an available surplus food listing
// @route   POST /api/ngo/listings/:id/claim
// @access  Private/NGO (Requires Verified Account)
export const claimFoodListing = asyncHandler(async (req, res) => {
  const { requestedVolunteer, volunteerId } = req.body;
  const listing = await FoodListing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error("Food listing not found");
  }

  if (listing.status !== "available") {
    res.status(400);
    throw new Error("This food listing is no longer available");
  }

  // Check if NGO already requested
  const existingClaim = listing.claims.find((c) => c.ngoId.toString() === req.user._id.toString());
  if (existingClaim) {
    res.status(400);
    throw new Error("You have already submitted a claim request for this listing");
  }

  listing.claims.push({
    ngoId: req.user._id,
    requestedVolunteer: requestedVolunteer !== false,
    status: "pending",
  });
  listing.status = "claimed";
  await listing.save();

  // Notify Restaurant Owner
  await Notification.create({
    recipientId: listing.restaurantId,
    senderId: req.user._id,
    title: "✋ New NGO Claim Request!",
    message: `${req.user.name} (NGO) requested to claim '${listing.title}' (${listing.quantityKg}kg).`,
    type: "CLAIM_REQUEST",
    entityId: listing._id,
    entityType: "FoodListing",
  });

  res.json({ message: "Claim request submitted successfully", listing });
});

// @desc    Get NGO active & completed donations
// @route   GET /api/ngo/my-donations
// @access  Private/NGO
export const getMyNgoDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ ngoId: req.user._id })
    .populate("listingId")
    .populate("restaurantId", "name email phone address ratingAvg")
    .populate("volunteerId", "name email phone vehicleType ratingAvg")
    .sort("-createdAt");

  res.json(donations);
});

// @desc    Verify Pickup OTP (Direct NGO pickup mode)
// @route   POST /api/ngo/donations/:id/verify-otp
// @access  Private/NGO
export const verifyPickupOtpNgo = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const donation = await Donation.findById(req.params.id).populate("listingId");

  if (!donation) {
    res.status(404);
    throw new Error("Donation record not found");
  }

  if (donation.ngoId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized for this donation");
  }

  if (!otp || donation.pickupOtp !== String(otp).trim()) {
    res.status(400);
    throw new Error("Invalid Pickup OTP. Please verify with the restaurant owner.");
  }

  donation.status = "picked_up";
  donation.otpVerifiedAt = new Date();
  donation.auditTrail.push({
    status: "picked_up",
    timestamp: new Date(),
    updatedBy: req.user._id,
    updatedByRole: "ngo",
    notes: "Pickup OTP verified at restaurant by NGO representative.",
  });
  await donation.save();

  // Update listing status
  await FoodListing.findByIdAndUpdate(donation.listingId._id, { status: "picked_up" });

  // Notify Restaurant
  await Notification.create({
    recipientId: donation.restaurantId,
    senderId: req.user._id,
    title: "✅ Pickup Verified!",
    message: `${req.user.name} verified the pickup OTP and received the food.`,
    type: "OTP_VERIFIED",
    entityId: donation._id,
    entityType: "Donation",
  });

  res.json({ message: "Pickup OTP verified successfully!", donation });
});

// @desc    Submit Final Distribution Proof (Photo + Headcount + Location)
// @route   POST /api/ngo/donations/:id/distribution-proof
// @access  Private/NGO
export const submitDistributionProof = asyncHandler(async (req, res) => {
  const { headcountServed, locationAddress, notes, lat, lng } = req.body;
  const donation = await Donation.findById(req.params.id).populate("listingId");

  if (!donation) {
    res.status(404);
    throw new Error("Donation record not found");
  }

  if (donation.ngoId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to submit distribution proof for this donation");
  }

  let photoUrl = "";
  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file.path, "distribution_proofs");
  } else if (req.body.photoUrl) {
    photoUrl = req.body.photoUrl;
  } else {
    photoUrl = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80";
  }

  const headcount = Number(headcountServed) || 1;

  donation.distributionProof = {
    photoUrl,
    headcountServed: headcount,
    locationAddress: locationAddress || req.user.address?.city || "Local Community Distribution Point",
    coordinates: {
      lat: Number(lat) || req.user.address?.coordinates?.lat || 19.0760,
      lng: Number(lng) || req.user.address?.coordinates?.lng || 72.8777,
    },
    notes: notes || "",
    verifiedAt: new Date(),
  };

  donation.status = "distributed";
  donation.auditTrail.push({
    status: "distributed",
    timestamp: new Date(),
    updatedBy: req.user._id,
    updatedByRole: "ngo",
    notes: `Distribution proof submitted: ${headcount} people fed with photo proof.`,
    location: {
      lat: Number(lat) || 19.0760,
      lng: Number(lng) || 72.8777,
      address: locationAddress,
    },
  });

  // Also close audit trail
  donation.auditTrail.push({
    status: "closed",
    timestamp: new Date(),
    updatedBy: req.user._id,
    updatedByRole: "ngo",
    notes: "Donation cycle closed with full accountability.",
  });
  donation.status = "closed";
  await donation.save();

  // Update FoodListing status
  await FoodListing.findByIdAndUpdate(donation.listingId._id, { status: "distributed" });

  // Update NGO Impact Stats
  const ngoUser = await User.findById(req.user._id);
  if (ngoUser) {
    ngoUser.impactStats.totalFoodDonatedKg += donation.listingId?.quantityKg || 0;
    ngoUser.impactStats.peopleServed += headcount;
    ngoUser.impactStats.totalMealsProvided += (donation.listingId?.quantityKg || 0) * 4;
    await ngoUser.save();
  }

  // Update Restaurant Impact Stats
  const restaurantUser = await User.findById(donation.restaurantId);
  if (restaurantUser) {
    restaurantUser.impactStats.totalFoodDonatedKg += donation.listingId?.quantityKg || 0;
    restaurantUser.impactStats.peopleServed += headcount;
    restaurantUser.impactStats.totalMealsProvided += (donation.listingId?.quantityKg || 0) * 4;
    await restaurantUser.save();
  }

  // Update Volunteer Impact Stats if volunteer involved
  if (donation.volunteerId) {
    const volUser = await User.findById(donation.volunteerId);
    if (volUser) {
      volUser.impactStats.deliveriesCompleted += 1;
      volUser.impactStats.peopleServed += headcount;
      volUser.impactStats.totalMealsProvided += (donation.listingId?.quantityKg || 0) * 4;
      await volUser.save();
    }
  }

  // Notify Restaurant & Volunteer
  await Notification.create({
    recipientId: donation.restaurantId,
    senderId: req.user._id,
    title: "🎉 Food Distributed & Impact Recorded!",
    message: `Your food donation fed ${headcount} people! Distribution proof and photos are uploaded.`,
    type: "DISTRIBUTED",
    entityId: donation._id,
    entityType: "Donation",
  });

  res.json({ message: "Distribution proof submitted and donation closed!", donation });
});
