import express from "express";
import { uploadVerificationDocument, getMyDocuments } from "./verificationController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../config/cloudinary.js";

const router = express.Router();

router.post("/upload", protect, upload.single("document"), uploadVerificationDocument);
router.get("/my-documents", protect, getMyDocuments);

export default router;
