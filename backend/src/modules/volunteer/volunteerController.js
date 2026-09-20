import asyncHandler from "express-async-handler";
import Donation from "../../models/Donation.js";
import FoodListing from "../../models/FoodListing.js";
import User from "../../models/User.js";
import Notification from "../../models/Notification.js";
import { uploadToCloudinary } from "../../config/cloudinary.js";

// @desc    Get available volunteer pickup tasks
// @route   GET /api/volunteer/available-tasks
// @access  Private/Volunteer
export const getAvailableTasks = asyncHandler(async (req, res) => {
  // Finds donations needing a volunteer (pickupType = volunteer_delivery, volunteerId = null/me, status = assigned)
  const donations = await Donation.find({
    pickupType: "volunteer_delivery",
    status: "assigned",
    $or: [{ volunteerId: null }, { volunteerId: req.user._id }],
  })
    .populate("listingId")
    .populate("restaurantId", "name phone address ratingAvg")
    .populate("ngoId", "name phone address ratingAvg")
    .sort("-createdAt");

  res.json(donations);
});

// @desc    Accept a volunteer delivery task
// @route   POST /api/volunteer/tasks/:id/accept
// @access  Private/Volunteer (Requires Verified Account)
export const acceptDeliveryTask = asyncHandler(async (req, res) => {
  // Use atomic findOneAndUpdate to prevent race conditions (BUG-007)
  const donation = await Donation.findOneAndUpdate(
    {
      _id: req.params.id,
      status: "assigned",
      $or: [{ volunteerId: null }, { volunteerId: req.user._id }],
    },
    {
      $set: { volunteerId: req.user._id },
      $push: {
        auditTrail: {
          status: "assigned",
          timestamp: new Date(),
          updatedBy: req.user._id,
          updatedByRole: "volunteer",
          notes: `Volunteer ${req.user.name} accepted the delivery task.`,
        },
      },
    },
    { returnDocument: "after" }
  ).populate("listingId");

  if (!donation) {
    res.status(400);
    throw new Error("This task has already been accepted by another volunteer or is no longer available");
  }

  // Also update listing active volunteer ID
  if (donation.listingId) {
    await FoodListing.findByIdAndUpdate(donation.listingId._id, { activeVolunteerId: req.user._id });
  }

  // Notify Restaurant and NGO
  await Notification.create({
    recipientId: donation.restaurantId,
    senderId: req.user._id,
    title: "🛵 Volunteer Assigned!",
    message: `${req.user.name} (Volunteer) accepted the delivery task and is heading to your location for pickup.`,
    type: "VOLUNTEER_ASSIGNED",
    entityId: donation._id,
    entityType: "Donation",
  });

  await Notification.create({
    recipientId: donation.ngoId,
    senderId: req.user._id,
    title: "🛵 Volunteer Assigned!",
    message: `${req.user.name} (Volunteer) accepted the delivery task for your claimed food.`,
    type: "VOLUNTEER_ASSIGNED",
    entityId: donation._id,
    entityType: "Donation",
  });

  res.json({ message: "Delivery task accepted successfully!", donation });
});

// @desc    Verify Pickup OTP at Restaurant (Volunteer handoff)
// @route   POST /api/volunteer/tasks/:id/verify-otp
// @access  Private/Volunteer
export const verifyPickupOtpVolunteer = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const donation = await Donation.findById(req.params.id).populate("listingId");

  if (!donation) {
    res.status(404);
    throw new Error("Donation task not found");
  }

  if (!donation.volunteerId || donation.volunteerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized for this task");
  }

  if (!otp || donation.pickupOtp !== String(otp).trim()) {
    res.status(400);
    throw new Error("Invalid Pickup OTP. Please request correct OTP from the restaurant owner.");
  }

  donation.status = "in_transit";
  donation.otpVerifiedAt = new Date();
  donation.auditTrail.push({
    status: "picked_up",
    timestamp: new Date(),
    updatedBy: req.user._id,
    updatedByRole: "volunteer",
    notes: "Pickup OTP verified at restaurant by volunteer.",
  });
  donation.auditTrail.push({
    status: "in_transit",
    timestamp: new Date(),
    updatedBy: req.user._id,
    updatedByRole: "volunteer",
    notes: "Volunteer picked up food and is in-transit to NGO/distribution destination.",
  });
  await donation.save();

  // Update listing status
  await FoodListing.findByIdAndUpdate(donation.listingId._id, { status: "in_transit" });

  // Notify Restaurant & NGO
  await Notification.create({
    recipientId: donation.restaurantId,
    senderId: req.user._id,
    title: "🛵 Food Picked Up & In Transit",
    message: `${req.user.name} verified OTP, picked up the food, and is now in transit.`,
    type: "IN_TRANSIT",
    entityId: donation._id,
    entityType: "Donation",
  });

  await Notification.create({
    recipientId: donation.ngoId,
    senderId: req.user._id,
    title: "🛵 Food Picked Up & In Transit",
    message: `${req.user.name} picked up the food from the restaurant and is delivering it to you!`,
    type: "IN_TRANSIT",
    entityId: donation._id,
    entityType: "Donation",
  });

  res.json({ message: "OTP verified! Food is now in transit.", donation });
});

// @desc    Get active & past volunteer delivery tasks
// @route   GET /api/volunteer/my-tasks
// @access  Private/Volunteer
export const getMyVolunteerTasks = asyncHandler(async (req, res) => {
  const tasks = await Donation.find({ volunteerId: req.user._id })
    .populate("listingId")
    .populate("restaurantId", "name phone address ratingAvg")
    .populate("ngoId", "name phone address ratingAvg")
    .sort("-createdAt");

  res.json(tasks);
});

// @desc    Submit volunteer delivery completion proof
// @route   POST /api/volunteer/tasks/:id/complete-delivery
// @access  Private/Volunteer
export const submitVolunteerDeliveryProof = asyncHandler(async (req, res) => {
  const { headcountServed, locationAddress, notes, lat, lng } = req.body;
  const donation = await Donation.findById(req.params.id).populate("listingId");

  if (!donation) {
    res.status(404);
    throw new Error("Donation task not found");
  }

  // BUG-003 Fix: Volunteer ownership check
  if (!donation.volunteerId || donation.volunteerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to submit delivery proof for this donation");
  }

  let photoUrl = "";
  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file.path, "delivery_proofs");
  } else if (req.body.photoUrl) {
    photoUrl = req.body.photoUrl;
  } else {
    photoUrl = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80";
  }

  const headcount = Number(headcountServed) || 1;

  donation.distributionProof = {
    photoUrl,
    headcountServed: headcount,
    locationAddress: locationAddress || "Distribution Drop-off Location",
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
    updatedByRole: "volunteer",
    notes: `Delivery proof submitted by Volunteer. ${headcount} people served.`,
    location: {
      lat: Number(lat) || 19.0760,
      lng: Number(lng) || 72.8777,
      address: locationAddress,
    },
  });
  donation.auditTrail.push({
    status: "closed",
    timestamp: new Date(),
    updatedBy: req.user._id,
    updatedByRole: "volunteer",
    notes: "Donation delivery completed and audit closed.",
  });
  donation.status = "closed";
  await donation.save();

  // Update FoodListing status
  await FoodListing.findByIdAndUpdate(donation.listingId._id, { status: "distributed" });

  // Update volunteer stats
  const volunteerUser = await User.findById(req.user._id);
  if (volunteerUser) {
    volunteerUser.impactStats.deliveriesCompleted += 1;
    volunteerUser.impactStats.peopleServed += headcount;
    volunteerUser.impactStats.totalMealsProvided += (donation.listingId?.quantityKg || 0) * 4;
    await volunteerUser.save();
  }

  // Update NGO & Restaurant impact stats
  const ngoUser = await User.findById(donation.ngoId);
  if (ngoUser) {
    ngoUser.impactStats.totalFoodDonatedKg += donation.listingId?.quantityKg || 0;
    ngoUser.impactStats.peopleServed += headcount;
    ngoUser.impactStats.totalMealsProvided += (donation.listingId?.quantityKg || 0) * 4;
    await ngoUser.save();
  }

  const restaurantUser = await User.findById(donation.restaurantId);
  if (restaurantUser) {
    restaurantUser.impactStats.totalFoodDonatedKg += donation.listingId?.quantityKg || 0;
    restaurantUser.impactStats.peopleServed += headcount;
    restaurantUser.impactStats.totalMealsProvided += (donation.listingId?.quantityKg || 0) * 4;
    await restaurantUser.save();
  }

  // Notify NGO & Restaurant
  await Notification.create({
    recipientId: donation.ngoId,
    senderId: req.user._id,
    title: "🎉 Delivery Completed!",
    message: `Volunteer ${req.user.name} delivered the food and uploaded distribution proof (${headcount} people fed).`,
    type: "DISTRIBUTED",
    entityId: donation._id,
    entityType: "Donation",
  });

  await Notification.create({
    recipientId: donation.restaurantId,
    senderId: req.user._id,
    title: "🎉 Delivery Completed!",
    message: `Volunteer ${req.user.name} completed delivery of your food listing!`,
    type: "DISTRIBUTED",
    entityId: donation._id,
    entityType: "Donation",
  });

  res.json({ message: "Delivery completed and proof submitted!", donation });
});
