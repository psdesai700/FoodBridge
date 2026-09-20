import { io } from "socket.io-client";

let socket;

export const initSocket = (user) => {
  if (!socket) {
    socket = io("/", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("⚡ Socket connected:", socket.id);
      if (user) {
        socket.emit("join_room", `user_${user._id}`);
        socket.emit("join_room", `role_${user.role}`);
        if (user.role === "admin") {
          socket.emit("join_room", "admin_room");
        }
      }
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
