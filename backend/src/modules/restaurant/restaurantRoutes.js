import express from "express";
import {
  createFoodListing,
  getMyListings,
  respondToClaimRequest,
  getRestaurantHistory,
} from "./restaurantController.js";
import { protect, authorize, requireVerified } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";

const router = express.Router();

router.use(protect, authorize("restaurant"));

router.post("/listings", requireVerified, upload.array("photos", 5), createFoodListing);
router.get("/my-listings", getMyListings);
router.put("/listings/:id/claim-response", respondToClaimRequest);
router.get("/history", getRestaurantHistory);

export default router;
