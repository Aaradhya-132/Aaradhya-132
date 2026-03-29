import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import bcrypt from "bcryptjs";

/**
 * @desc    Retrieves current user profile details.
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").populate("favorites");
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Updates current user profile details.
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { bio, phone, avatar, username } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();
    const { password, ...userData } = updatedUser.toObject();

    return res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully.", 
      data: userData 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Changes account password.
 * @route   PUT /api/users/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "Account not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password does not match." });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Toggles a trip in user's favorites list.
 * @route   POST /api/users/favorites/:tripId
 * @access  Private
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { tripId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    const favIndex = user.favorites.indexOf(tripId);
    if (favIndex > -1) {
      user.favorites.splice(favIndex, 1);
    } else {
      user.favorites.push(tripId);
    }

    await user.save();
    return res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Retrieves all registered users.
 */
export const getAllUsersAdmin = async (req, res) => {
  try {
    const list = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Updates user verification status.
 */
export const updateUserVerification = async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: verified }, { new: true });
    return res.status(200).json({ 
      success: true, 
      message: `User ${verified ? "verified" : "revoked"} successfully.`, 
      data: user 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Deletes a user and cascades all their data.
 */
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Target user not found." });

    // Cascade deletion of owned trips
    const trips = await Trip.find({ author: id }).select("_id");
    const tripIds = trips.map((t) => t._id);

    await Trip.deleteMany({ author: id });
    await Booking.deleteMany({
      $or: [{ traveler: id }, { tripRef: { $in: tripIds } }],
    });
    await Message.deleteMany({
      $or: [{ "sender.id": id }, { room: { $in: tripIds } }],
    });
    await Notification.deleteMany({ recipient: id });
    
    // Clean favorites
    if (tripIds.length > 0) {
      await User.updateMany({}, { $pull: { favorites: { $in: tripIds } } });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ 
      success: true, 
      message: "User and all associated data purged successfully." 
    });
  } catch (error) {
    console.error("Purge User Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
