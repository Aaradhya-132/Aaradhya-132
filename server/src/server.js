import { createServer } from "http";
import dotenv from "dotenv";
import connectDatabase from "./configs/database.js";
import initializeSocket from "./configs/socket.js";
import { app, sessionMiddleware } from "./app.js";

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDatabase();

// Create HTTP Server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer, sessionMiddleware);

// Share IO Instance with Request Objects
app.set("io", io);

// Start Server Listener
httpServer.listen(PORT, () => {
  console.log(`🚀 explorer.ai Server operational on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Shut server down in production manually if needed
});
