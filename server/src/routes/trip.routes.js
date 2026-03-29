import express from "express";
import { 
  createItinerary, 
  getMyItineraries, 
  getPublicItineraries, 
  fetchItineraryDetail, 
  removeItinerary,
  modifyItineraryStatus,
  modifyOrganiserApproval,
  getAllItinerariesAdmin
} from "../controllers/trip.controller.js";
import { requireAuth, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", getPublicItineraries);
router.get("/:id", fetchItineraryDetail);

// Protected User Routes
router.post("/", requireAuth, createItinerary);
router.get("/user/my-trips", requireAuth, getMyItineraries);
router.delete("/:id", requireAuth, removeItinerary);

// Admin Routes
router.get("/admin/all", adminOnly, getAllItinerariesAdmin);
router.patch("/:id/status", adminOnly, modifyItineraryStatus);
router.patch("/:id/organiser-status", adminOnly, modifyOrganiserApproval);

export default router;
