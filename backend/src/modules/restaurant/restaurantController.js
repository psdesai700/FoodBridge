import asyncHandler from "express-async-handler";
import FoodListing from "../../models/FoodListing.js";
import Donation from "../../models/Donation.js";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// Helper function to generate a 4-digit numeric OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Post a new surplus food listing
// @route   POST /api/restaurant/listings
// @access  Private/Restaurant (Requires Verified Account)
export const createFoodListing = asyncHandler(async (req, res) => {
  const { title, foodType, quantityKg, estimatedServings, expiryWindowHours, pickupAddress, specialInstructions } =
    req.body;

  let parsedAddress = pickupAddress;
  if (typeof pickupAddress === "string") {
    parsedAddress = JSON.parse(pickupAddress);
  }

  // Parse photos uploaded
  let photos = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.path, "food_listings");
      photos.push(url);
    }
  } else if (req.body.photoUrls) {
    photos = Array.isArray(req.body.photoUrls) ? req.body.photoUrls : [req.body.photoUrls];
  } else {
    // Default placeholder photo if none uploaded
    photos = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"];
  }

  const prepTime = new Date();
  const expiresAt = new Date(prepTime.getTime() + (Number(expiryWindowHours) || 4) * 60 * 60 * 1000);

  const listing = await FoodListing.create({
    restaurantId: req.user._id,
    title,
    foodType,
    quantityKg: Number(quantityKg),
    estimatedServings: Number(estimatedServings),
    prepTime,
    expiryWindowHours: Number(expiryWindowHours),
    expiresAt,
    pickupAddress: parsedAddress || req.user.address,
    photos,
    specialInstructions: specialInstructions || "",
    status: "available",
  });

  // Notify verified NGOs and Volunteers in real-time
  const nearbyUsers = await User.find({
    role: { $in: ["ngo", "volunteer"] },
    isVerified: true,
  });

  for (const user of nearbyUsers) {
    await Notification.create({
      recipientId: user._id,
      senderId: req.user._id,
      title: "🍱 New Surplus Food Available!",
      message: `${req.user.name} posted ${quantityKg}kg of surplus ${foodType} food in ${parsedAddress?.city || "your city"}.`,
      type: "LISTING_POSTED",
      entityId: listing._id,
      entityType: "FoodListing",
    });
  }

  res.status(201).json(listing);
});

// @desc    Get listings created by this restaurant
// @route   GET /api/restaurant/my-listings
// @access  Private/Restaurant
export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await FoodListing.find({ restaurantId: req.user._id })
    .populate("claims.ngoId", "name email phone profileDetails ratingAvg")
    .populate("activeNGOId", "name email phone profileDetails ratingAvg")
    .populate("activeVolunteerId", "name email phone profileDetails ratingAvg")
    .sort("-createdAt");

  res.json(listings);
});

// @desc    Accept/Reject an NGO claim request and generate Pickup OTP
// @route   PUT /api/restaurant/listings/:id/claim-response
// @access  Private/Restaurant
export const respondToClaimRequest = asyncHandler(async (req, res) => {
  const { ngoId, action, volunteerId } = req.body; // action: "accept" | "reject"
  const listing = await FoodListing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error("Food listing not found");
  }

  if (listing.restaurantId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to manage this listing");
  }

  const claimItem = listing.claims.find((c) => c.ngoId.toString() === ngoId);

  if (!claimItem) {
    res.status(404);
    throw new Error("Claim request from this NGO not found");
  }

  // BUG-012 Fix: Validate claim request status is pending
  if (claimItem.status !== "pending") {
    res.status(400);
    throw new Error(`Claim request has already been processed (current status: ${claimItem.status})`);
  }

  if (action === "reject") {
    claimItem.status = "rejected";
    await listing.save();

    await Notification.create({
      recipientId: ngoId,
      senderId: req.user._id,
      title: "Claim Request Rejected",
      message: `${req.user.name} was unable to accept your claim request for '${listing.title}'.`,
      type: "CLAIM_REJECTED",
      entityId: listing._id,
      entityType: "FoodListing",
    });

    return res.json({ message: "Claim request rejected", listing });
  }

  // BUG-012 Fix: Validate optional volunteerId user role and verification status
  if (volunteerId) {
    const volUser = await User.findById(volunteerId);
    if (!volUser || volUser.role !== "volunteer" || !volUser.isVerified || volUser.isSuspended) {
      res.status(400);
      throw new Error("Specified volunteer is invalid, unverified, or suspended");
    }
  }

  // Accept Claim Request -> Generate Pickup OTP
  claimItem.status = "accepted";
  const pickupOtp = generateOTP();

  listing.status = "assigned";
  listing.activeNGOId = ngoId;
  listing.otpCode = pickupOtp;
  if (volunteerId) {
    listing.activeVolunteerId = volunteerId;
  }
  await listing.save();

  // Create active Donation tracking record with Audit Trail step
  const donation = await Donation.create({
    listingId: listing._id,
    restaurantId: req.user._id,
    ngoId,
    volunteerId: volunteerId || null,
    pickupType: claimItem.requestedVolunteer || volunteerId ? "volunteer_delivery" : "direct_ngo",
    quantityKg: listing.quantityKg || 0,
    status: "assigned",
    pickupOtp,
    auditTrail: [
      {
        status: "listed",
        timestamp: listing.createdAt,
        updatedBy: req.user._id,
        updatedByRole: "restaurant",
        notes: "Food listing created by restaurant",
      },
      {
        status: "claimed",
        timestamp: claimItem.requestedAt,
        updatedBy: ngoId,
        updatedByRole: "ngo",
        notes: "Claimed by NGO",
      },
      {
        status: "assigned",
        timestamp: new Date(),
        updatedBy: req.user._id,
        updatedByRole: "restaurant",
        notes: `Restaurant accepted claim and generated Pickup OTP. Pickup type: ${
          volunteerId || claimItem.requestedVolunteer ? "Volunteer Delivery" : "Direct NGO Pickup"
        }`,
      },
    ],
  });

  // Notify NGO
  await Notification.create({
    recipientId: ngoId,
    senderId: req.user._id,
    title: "🎉 Claim Accepted!",
    message: `${req.user.name} accepted your claim for '${listing.title}'. Pickup OTP is generated and ready for handoff.`,
    type: "CLAIM_ACCEPTED",
    entityId: donation._id,
    entityType: "Donation",
  });

  // If volunteer is assigned, notify volunteer
  if (volunteerId) {
    await Notification.create({
      recipientId: volunteerId,
      senderId: req.user._id,
      title: "🛵 New Volunteer Delivery Task Assigned!",
      message: `You have been assigned to pick up '${listing.title}' from ${req.user.name}.`,
      type: "VOLUNTEER_ASSIGNED",
      entityId: donation._id,
      entityType: "Donation",
    });
  }

  res.json({
    message: "Claim request accepted and Pickup OTP generated",
    pickupOtp,
    listing,
    donation,
  });
});

// @desc    Get restaurant impact & donation history
// @route   GET /api/restaurant/history
// @access  Private/Restaurant
export const getRestaurantHistory = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ restaurantId: req.user._id })
    .populate("listingId")
    .populate("ngoId", "name phone email address")
    .populate("volunteerId", "name phone vehicleType")
    .sort("-createdAt");

  const completed = donations.filter((d) => ["distributed", "closed"].includes(d.status));
  const totalFoodDonatedKg = completed.reduce((acc, curr) => acc + (curr.listingId?.quantityKg || 0), 0);
  const totalMealsProvided = totalFoodDonatedKg * 4;

  res.json({
    donations,
    impactStats: {
      totalDonations: donations.length,
      completedDonations: completed.length,
      totalFoodDonatedKg,
      totalMealsProvided,
    },
  });
});
