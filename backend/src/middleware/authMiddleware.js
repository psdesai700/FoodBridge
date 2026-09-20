import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

// Protect routes with JWT verification
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "foodbridge_super_secret_jwt_key_2026_safe_token");
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User not found or account removed");
      }

      if (req.user.isSuspended) {
        res.status(403);
        throw new Error(`Account suspended: ${req.user.suspensionReason || "Violated community standards"}`);
      }

      return next();
    } catch (error) {
      if (res.statusCode === 200) res.status(401);
      throw error;
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user?.role}' is not authorized to access this resource`);
    }
    next();
  };
};

// Require admin-approved account verification for sensitive actions (e.g. posting listings or claiming)
export const requireVerified = (req, res, next) => {
  if (!req.user.isVerified && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Your account requires document verification approval by an Admin before taking this action.");
  }
  next();
};
