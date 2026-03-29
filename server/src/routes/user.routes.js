import express from "express";
import { 
  getProfile, 
  updateProfile, 
  changePassword, 
  toggleFavorite, 
  getAllUsersAdmin, 
  updateUserVerification, 
  deleteUserAdmin 
} from "../controllers/user.controller.js";
import { requireAuth, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected User Profile Routes
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.put("/change-password", requireAuth, changePassword);
router.post("/favorites/:tripId", requireAuth, toggleFavorite);

// Protected Admin User Management Routes
router.get("/admin/all", adminOnly, getAllUsersAdmin);
router.patch("/admin/verify/:id", adminOnly, updateUserVerification);
router.delete("/admin/:id", adminOnly, deleteUserAdmin);

export default router;
