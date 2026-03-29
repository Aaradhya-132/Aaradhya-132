import express from "express";
import { 
  requestParticipation, 
  getUserBookings, 
  getCreatorRequests, 
  validateBooking, 
  cancelBooking, 
  getAllBookingsAdmin 
} from "../controllers/booking.controller.js";
import { requireAuth, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected User Routes
router.post("/join", requireAuth, requestParticipation);
router.get("/my-requests", requireAuth, getUserBookings);
router.get("/incoming-requests", requireAuth, getCreatorRequests);
router.delete("/:id", requireAuth, cancelBooking);

// Admin Routes
router.get("/admin/all", adminOnly, getAllBookingsAdmin);
router.put("/admin/validate/:id", adminOnly, validateBooking);

export default router;
