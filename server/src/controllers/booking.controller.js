import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Trip from "../models/Trip.js";

/**
 * @desc    Submits a new trip participation request.
 * @route   POST /api/bookings/join
 * @access  Private
 */
export const requestParticipation = async (req, res) => {
  try {
    const { destination, tripId, hotelId, hotelName, hotelImage, hotelAddress, price } = req.body;
    const userId = req.user.id;

    const alreadyRequested = await Booking.findOne({ traveler: userId, destination });
    if (alreadyRequested) {
      return res.status(400).json({ 
        success: false, 
        message: "A participation request for this destination already exists." 
      });
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: "User session is no longer valid." });
    }

    const newBooking = await Booking.create({
      traveler: userId,
      destination,
      tripRef: tripId || undefined,
      hotelDetails: {
        id: hotelId,
        name: hotelName,
        image: hotelImage,
        address: hotelAddress,
      },
      price,
      travelerInfo: {
        name: currentUser.username,
        email: currentUser.email,
      },
      bookingStatus: "pending",
    });

    const io = req.app.get("io");

    // Notification Logic
    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (trip && trip.organiserApprovalStatus === "approved") {
        const alert = await Notification.create({
          recipient: trip.author,
          category: "booking_request",
          alertContent: `New join request from ${currentUser.username} for your trip to ${destination}`,
          actionLink: "/organiser",
        });
        if (io) io.to(`user_${trip.author}`).emit("notification_new", alert);
      } else {
        // Notify Admins if no approved organiser
        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
          const alert = await Notification.create({
            recipient: admin._id,
            category: "booking_request",
            alertContent: `New booking request from ${currentUser.username} for ${destination}`,
            actionLink: "/admin",
          });
          if (io) io.to(`user_${admin._id}`).emit("notification_new", alert);
        }
      }
    }

    return res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    console.error("Participation Request Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

/**
 * @desc    Retrieves all bookings/requests for the current user.
 * @route   GET /api/bookings/my-requests
 * @access  Private
 */
export const getUserBookings = async (req, res) => {
  try {
    const list = await Booking.find({ traveler: req.user.id }).populate("tripRef");
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching bookings." });
  }
};

/**
 * @desc    Retrieves all participation requests for trips created by the user.
 * @route   GET /api/bookings/incoming-requests
 * @access  Private (Organiser/Author)
 */
export const getCreatorRequests = async (req, res) => {
  try {
    const myTrips = await Trip.find({ author: req.user.id }).select("_id");
    const tripIds = myTrips.map((t) => t._id);

    const requests = await Booking.find({ tripRef: { $in: tripIds } })
      .populate("traveler", "username email")
      .populate("tripRef", "destination");

    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Updates booking status (Admin only).
 */
export const validateBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: status },
      { new: true }
    );

    const io = req.app.get("io");
    const alert = await Notification.create({
      recipient: booking.traveler,
      category: "booking_status",
      alertContent: `Your booking for ${booking.destination} has been ${status}`,
      actionLink: `/view-trip/${booking.tripRef}`,
    });
    if (io) io.to(`user_${booking.traveler}`).emit("notification_new", alert);

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Cancels a booking (User self-cancel).
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.traveler.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized cancellation attempt." });
    }

    await Booking.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Booking cancelled successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Admin: Get all bookings.
 */
export const getAllBookingsAdmin = async (req, res) => {
  try {
    const list = await Booking.find()
      .populate("traveler", "username email")
      .populate("tripRef")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
