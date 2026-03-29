import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * @desc    Registers a new user and awaits admin approval.
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required registration fields.",
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const usernameTrimmed = username.trim();

    const emailExists = await User.findOne({ email: emailNormalized });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "This email address is already in use.",
      });
    }

    const usernameExists = await User.findOne({ username: usernameTrimmed });
    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "This username is already taken.",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username: usernameTrimmed,
      email: emailNormalized,
      password: passwordHash,
      role: role || "user",
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. Pending administrative approval.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration.",
    });
  }
};

/**
 * @desc    Authenticates user and starts a session.
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailNormalized });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your details.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your details.",
      });
    }

    // verification check if needed
    // if (!user.isVerified && user.role !== 'admin') { ... }

    req.session.user = {
      id: user._id,
      role: user.role,
      isVerified: user.isVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/**
 * @desc    Destroys the current user session and clears the cookie.
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to terminate session.",
      });
    }
    res.clearCookie("explorer.ai_session");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
};

/**
 * @desc    Retrieves current authenticated user from session.
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({
      success: false,
      message: "No active session found.",
    });
  }

  try {
    const user = await User.findById(req.session.user.id).select("-password");
    if (!user) {
      req.session.destroy();
      return res.status(404).json({
        success: false,
        message: "User not found. Session cleared.",
      });
    }

    // Refresh session data
    req.session.user = {
      id: user._id,
      role: user.role,
      isVerified: user.isVerified,
    };

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
