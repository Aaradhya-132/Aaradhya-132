import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Trip author is required"],
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    itinerary: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Trip itinerary data is required"],
    },
    durationDays: {
      type: Number,
    },
    budgetLevel: {
      type: String,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    maxCapacity: {
      type: Number,
      default: 10,
    },
    pricePerPerson: {
      type: Number,
    },
    isOrganiserRequest: {
      type: Boolean,
      default: false,
    },
    organiserApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
