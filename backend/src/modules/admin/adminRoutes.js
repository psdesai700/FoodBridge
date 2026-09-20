import express from "express";
import {
  getAdminStats,
  getPendingVerifications,
  reviewVerificationDocument,
  getAllUsers,
  toggleUserSuspension,
  getAllDonationsPipeline,
  getComplaintsAudit,
} from "./adminController.js";
import { protect, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Admin protection applied to all routes in this module
router.use(protect, authorize("admin"));

router.get("/stats", getAdminStats);
router.get("/verifications", getPendingVerifications);
router.put("/verifications/:id/review", reviewVerificationDocument);
router.get("/users", getAllUsers);
router.put("/users/:id/suspend", toggleUserSuspension);
router.get("/donations", getAllDonationsPipeline);
router.get("/complaints", getComplaintsAudit);

export default router;
