import express from "express";
import {
  getAvailableListings,
  claimFoodListing,
  getMyNgoDonations,
  verifyPickupOtpNgo,
  submitDistributionProof,
} from "./ngoController.js";
import { protect, authorize, requireVerified } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";
import { otpLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect, authorize("ngo"));

router.get("/listings", getAvailableListings);
router.post("/listings/:id/claim", requireVerified, claimFoodListing);
router.get("/my-donations", getMyNgoDonations);
router.post("/donations/:id/verify-otp", otpLimiter, verifyPickupOtpNgo);
router.post("/donations/:id/distribution-proof", upload.single("proofPhoto"), submitDistributionProof);

export default router;
