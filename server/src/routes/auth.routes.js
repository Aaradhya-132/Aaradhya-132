import express from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * Public Authentication Endpoints
 */
router.post("/register", registerUser);
router.post("/login", loginUser);

/**
 * Protected Authentication Endpoints
 */
router.post("/logout", requireAuth, logoutUser);
router.get("/me", requireAuth, getCurrentUser);

export default router;
