import express from "express";
import { getChatHistory } from "../controllers/message.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected Message Routes
router.get("/:tripId", requireAuth, getChatHistory);

export default router;
