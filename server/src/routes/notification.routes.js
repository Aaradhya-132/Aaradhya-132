import express from "express";
import { 
  getUserAlerts, 
  markAlertAsRead, 
  markAllViewed 
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected Notification Routes
router.get("/", requireAuth, getUserAlerts);
router.put("/:id/read", requireAuth, markAlertAsRead);
router.put("/mark-all-read", requireAuth, markAllViewed);

export default router;
