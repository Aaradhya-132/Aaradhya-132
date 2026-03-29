import Notification from "../models/Notification.js";
import Message from "../models/Message.js";

/**
 * @desc    Retrieves the most recent notifications for the authenticated user.
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserAlerts = async (req, res) => {
  try {
    const list = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(25);

    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Marks a specific notification as viewed.
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAlertAsRead = async (req, res) => {
  try {
    const alert = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (alert?.category === "chat_message" && alert.referenceId) {
      // Set expiry for related message (24h after reading notification)
      await Message.findByIdAndUpdate(alert.referenceId, {
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    return res.status(200).json({ success: true, data: alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Marks all unread notifications as viewed.
 * @route   PUT /api/notifications/mark-all-viewed
 * @access  Private
 */
export const markAllViewed = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    return res.status(200).json({ success: true, message: "All alerts acknowledged." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
