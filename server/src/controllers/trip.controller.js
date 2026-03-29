import Trip from "../models/Trip.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Message from "../models/Message.js";

/**
 * @desc    Creates a new travel itinerary.
 * @route   POST /api/trips
 * @access  Private
 */
export const createItinerary = async (req, res) => {
  try {
    const { tripData, destination, duration, budget, capacity, price, requestOrganiser } = req.body;

    const newTrip = await Trip.create({
      author: req.user.id,
      itinerary: tripData,
      destination,
      durationDays: duration,
      budgetLevel: budget,
      maxCapacity: capacity || 10,
      pricePerPerson: price,
      approvalStatus: "pending",
      isOrganiserRequest: requestOrganiser || false,
    });

    return res.status(201).json({
      success: true,
      data: newTrip,
    });
  } catch (error) {
    console.error("Create Itinerary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating itinerary.",
    });
  }
};

/**
 * @desc    Retrieves all itineraries created by the current user.
 * @route   GET /api/trips/user-trips
 * @access  Private
 */
export const getMyItineraries = async (req, res) => {
  try {
    const list = await Trip.find({ author: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Get My Itineraries Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user trips.",
    });
  }
};

/**
 * @desc    Fetches public itineraries based on filters.
 * @route   GET /api/trips
 * @access  Public
 */
export const getPublicItineraries = async (req, res) => {
  try {
    const { query, minDays, maxDays, budget } = req.query;
    const filter = { isPublic: true, approvalStatus: "approved" };

    if (query) {
      filter.destination = { $regex: query, $options: "i" };
    }
    if (minDays || maxDays) {
      filter.durationDays = {};
      if (minDays) filter.durationDays.$gte = Number(minDays);
      if (maxDays) filter.durationDays.$lte = Number(maxDays);
    }
    if (budget) {
      filter.budgetLevel = budget;
    }

    const publicList = await Trip.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: publicList,
    });
  } catch (error) {
    console.error("Get Public Itineraries Error:", error);
    return res.status(500).json({
      success: false,
      message: "An internal error occurred during fetch.",
    });
  }
};

/**
 * @desc    Fetches a single itinerary detail by ID.
 * @route   GET /api/trips/:id
 * @access  Public
 */
export const fetchItineraryDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.length < 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: "An invalid ID format was provided." });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: "Could not find requested trip." });
    }

    return res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error("Get Itinerary Detail Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching details.",
    });
  }
};

/**
 * @desc    Removes an itinerary and cleans up related data.
 * @route   DELETE /api/trips/:id
 * @access  Private (Admin or Owner)
 */
export const removeItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    const isAuthorized = trip.author.toString() === userId || userRole === "admin";
    if (!isAuthorized) {
      return res.status(403).json({ message: "You are not authorized to delete this itinerary." });
    }

    await Trip.findByIdAndDelete(id);

    // Cascade: Clean up bookings and messages
    const bookingsResult = await Booking.deleteMany({ tripRef: id });
    const messagesResult = await Message.deleteMany({ room: id });
    await User.updateMany({}, { $pull: { favorites: id } });

    console.log(`Cascade deletion: ${bookingsResult.deletedCount} bookings, ${messagesResult.deletedCount} messages removed.`);

    return res.status(200).json({
      success: true,
      message: "Itinerary removed with all associated data.",
    });
  } catch (error) {
    console.error("Remove Itinerary Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during deletion process.",
    });
  }
};

/**
 * @desc    Updates itinerary status (Admin only).
 */
export const modifyItineraryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Trip.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approves/Rejects organiser role for a trip (Admin only).
 */
export const modifyOrganiserApproval = async (req, res) => {
  try {
    const { status } = req.body;
    const trip = await Trip.findByIdAndUpdate(req.params.id, { organiserApprovalStatus: status }, { new: true });

    if (status === "approved") {
      await User.findByIdAndUpdate(trip.author, { role: "organiser" });
    }

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Fetches all itineraries for admin dashboard.
 */
export const getAllItinerariesAdmin = async (req, res) => {
  try {
    const list = await Trip.find().populate("author", "username email").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
