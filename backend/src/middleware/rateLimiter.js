import rateLimit from "express-rate-limit";

// Rate limiter for authentication login endpoint (BUG-008)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts from this IP, please try again after 15 minutes",
  },
});

// Rate limiter for OTP verification endpoints (BUG-008)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 OTP verification attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many failed OTP verification attempts. Please wait 15 minutes.",
  },
});
