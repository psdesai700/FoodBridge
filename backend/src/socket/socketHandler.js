import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Donation from "../models/Donation.js";
import User from "../models/User.js";

export const initSocketHandlers = (io) => {
  // Socket JWT authentication middleware (BUG-006)
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error: Token required"));
      }
      const secret = process.env.JWT_SECRET || "foodbridge_secret_jwt_key_2026";
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select("-password");
      if (!user || user.isSuspended) {
        return next(new Error("Authentication error: Invalid or suspended user"));
      }
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.id} (User: ${socket.user.name}, Role: ${socket.user.role})`);

    // Join user specific room or donation room
    socket.on("join_room", (data) => {
      const room = typeof data === "string" ? data : data.room;
      if (room) {
        socket.join(room);
        console.log(`👤 Socket ${socket.id} joined room: ${room}`);
      }
    });

    // Real-time GPS location update from Volunteer
    socket.on("update_location", async (data) => {
      const { donationId, lat, lng } = data;
      if (!donationId || lat === undefined || lng === undefined) return;

      if (socket.user.role !== "volunteer" && socket.user.role !== "admin") return;

      const locationData = {
        lat: Number(lat),
        lng: Number(lng),
        updatedAt: new Date(),
      };

      // Broadcast to room
      io.to(`donation_${donationId}`).emit("location_updated", {
        donationId,
        volunteerId: socket.user._id,
        location: locationData,
      });

      // Update donation record asynchronously
      try {
        await Donation.findByIdAndUpdate(donationId, {
          $set: { currentLocation: locationData },
          $push: { deliveryGpsHistory: { lat: Number(lat), lng: Number(lng) } },
        });
      } catch (err) {
        console.error("Error updating donation GPS history:", err.message);
      }
    });

    // Real-time Chat message
    socket.on("send_message", async (data) => {
      const { donationId, text } = data;
      if (!donationId || !text || !text.trim()) return;

      try {
        // Derive sender details from authenticated socket session (prevents forging)
        const message = await Message.create({
          donationId,
          senderId: socket.user._id,
          senderName: socket.user.name,
          senderRole: socket.user.role,
          text: text.trim(),
        });

        io.to(`donation_${donationId}`).emit("receive_message", message);
      } catch (err) {
        console.error("Error saving chat message via socket:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
