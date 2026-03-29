import Message from "../models/Message.js";
import Booking from "../models/Booking.js";
import Trip from "../models/Trip.js";

/**
 * @desc    Retrieves chat history for a specific trip.
 * @route   GET /api/messages/:tripId
 * @access  Private (Participants/Owner/Admin)
 */
export const getChatHistory = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    if (!tripId || tripId.length < 24 || !/^[0-9a-fA-F]{24}$/.test(tripId)) {
      return res.status(400).json({ 
        success: false, 
        message: "A valid Trip ID must be provided." 
      });
    }

    const isMember = await Booking.findOne({
      tripRef: tripId,
      traveler: userId,
      bookingStatus: "approved",
    });

    const trip = await Trip.findById(tripId);
    const isAuthor = trip && trip.author.toString() === userId;

    if (!isMember && !isAuthor && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Access restricted to approved trip participants." 
      });
    }

    const chatHistory = await Message.find({ room: tripId }).sort({ createdAt: 1 });
    
    // Transform to standard client format if necessary
    const formattedHistory = chatHistory.map(m => ({
      _id: m._id,
      tripId: m.room,
      author: m.sender.name,
      senderId: m.sender.id,
      message: m.content.text,
      type: m.content.contentType,
      imageUrl: m.content.assetUrl,
      createdAt: m.createdAt,
    }));

    return res.status(200).json({ success: true, data: formattedHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
