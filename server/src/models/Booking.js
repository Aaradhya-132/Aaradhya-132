import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    hotelDetails: {
      id: String,
      name: String,
      image: String,
      address: String,
    },
    price: {
      type: String,
    },
    travelerInfo: {
      name: String,
      email: String,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "revoked"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", reservationSchema);

export default Booking;
