import { Server } from "socket.io";
import Message from "../models/Message.js";
import Booking from "../models/Booking.js";
import Trip from "../models/Trip.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const initializeSocket = (server, sessionMiddleware) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Basic wrapper to share session with Socket.IO
  const wrap = (middleware) => (socket, next) =>
    middleware(socket.request, {}, next);
  io.use(wrap(sessionMiddleware));

  io.use(async (socket, next) => {
    try {
      const { session } = socket.request;
      if (!session || !session.user) {
        return next(new Error("Socket Auth Failed: No Session"));
      }

      const user = await User.findById(session.user.id);
      if (!user || (!user.isVerified && user.role !== "admin")) {
        return next(new Error("Socket Auth Failed: User not verified"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket Verification Error:", err);
      next(new Error("Socket internal authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user_${userId}`);
    console.log(`📡 Socket connected: [${socket.id}] UserID: ${userId}`);

    socket.on("join_chat", async (data) => {
      const { tripId } = data;

      if (!tripId || tripId.length < 24 || !/^[0-9a-fA-F]{24}$/.test(tripId)) {
        socket.emit("error", { message: "Invalid trip room ID." });
        return;
      }

      try {
        const trip = await Trip.findById(tripId);
        const isOwner = trip && trip.author.toString() === userId;
        const isApprovedParticipant = await Booking.findOne({
          tripRef: tripId,
          traveler: userId,
          bookingStatus: "approved",
        });

        if (!isApprovedParticipant && !isOwner && socket.user.role !== "admin") {
          socket.emit("error", {
            message: "You are not an approved member of this trip.",
          });
          return;
        }

        socket.join(`trip_${tripId}`);
        socket.emit("joined_room", { room: `trip_${tripId}` });
      } catch (err) {
        console.error("Join Chat Error:", err);
        socket.emit("error", { message: "Failed to join chat session." });
      }
    });

    socket.on("send_message", async (data) => {
      const { tripId, message, type, imageUrl } = data;

      if (!tripId) return;

      try {
        // Re-verify eligibility
        const trip = await Trip.findById(tripId);
        const isOwner = trip && trip.author.toString() === userId;
        const isApprovedParticipant = await Booking.findOne({
          tripRef: tripId,
          traveler: userId,
          bookingStatus: "approved",
        });

        if (!isApprovedParticipant && !isOwner && socket.user.role !== "admin") {
          return socket.emit("error", {
            message: "Membership unauthorized for messages.",
          });
        }

        const roomName = `trip_${tripId}`;
        const newMessage = new Message({
          room: tripId,
          sender: {
            id: userId,
            name: socket.user.username,
          },
          content: {
            text: message || (type === "image" ? "Photo shared" : ""),
            contentType: type || "text",
            assetUrl: imageUrl || "",
          },
        });

        const savedMsg = await newMessage.save();

        const msgBroadcast = {
          _id: savedMsg._id,
          tripId,
          author: savedMsg.sender.name,
          senderId: savedMsg.sender.id,
          message: savedMsg.content.text,
          type: savedMsg.content.contentType,
          imageUrl: savedMsg.content.assetUrl,
          createdAt: savedMsg.createdAt,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        };

        io.to(roomName).emit("receive_message", msgBroadcast);

        // Notifications
        const participants = await Booking.find({
          tripRef: tripId,
          bookingStatus: "approved",
          traveler: { $ne: userId },
        });

        participants.forEach(async (member) => {
          const alert = new Notification({
            recipient: member.traveler,
            category: "chat_message",
            alertContent: `New ${
              type === "image" ? "photo" : "message"
            } from ${socket.user.username}`,
            actionLink: `/chat?tripId=${tripId}`,
            referenceId: savedMsg._id,
          });
          await alert.save();
          io.to(`user_${member.traveler}`).emit("notification_new", alert);
        });
      } catch (err) {
        console.error("Message Processing Error:", err);
        socket.emit("error", { message: "Failed to deliver message." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: [${socket.id}]`);
    });
  });

  return io;
};

export default initializeSocket;
