import express from "express";
import {
  getDonationMessages,
  sendDonationMessage,
  getUserNotifications,
  markNotificationRead,
  submitRating,
} from "./chatController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/donation/:donationId", getDonationMessages);
router.post("/donation/:donationId", sendDonationMessage);

router.get("/notifications", getUserNotifications);
router.put("/notifications/:id/read", markNotificationRead);

router.post("/ratings", submitRating);

export default router;
