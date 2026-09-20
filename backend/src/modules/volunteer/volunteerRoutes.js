import express from "express";
import {
  getAvailableTasks,
  acceptDeliveryTask,
  verifyPickupOtpVolunteer,
  getMyVolunteerTasks,
  submitVolunteerDeliveryProof,
} from "./volunteerController.js";
import { protect, authorize, requireVerified } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";
import { otpLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.use(protect, authorize("volunteer"));

router.get("/available-tasks", getAvailableTasks);
router.post("/tasks/:id/accept", requireVerified, acceptDeliveryTask);
router.post("/tasks/:id/verify-otp", otpLimiter, verifyPickupOtpVolunteer);
router.get("/my-tasks", getMyVolunteerTasks);
router.post("/tasks/:id/complete-delivery", upload.single("proofPhoto"), submitVolunteerDeliveryProof);

export default router;
