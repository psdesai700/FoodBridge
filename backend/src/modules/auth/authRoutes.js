import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile } from "./authController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { loginLimiter } from "../../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginLimiter, loginUser);
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
