import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "foodbridge_super_secret_jwt_key_2026_safe_token";
  if (!secret) {
    throw new Error("FATAL: JWT_SECRET is not configured");
  }
  return jwt.sign({ id }, secret, {
    expiresIn: "30d",
  });
};

export default generateToken;
