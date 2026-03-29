import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["booking_request", "booking_status", "system", "chat_message"],
      required: true,
    },
    actionLink: {
      type: String,
      default: "",
    },
    alertContent: {
      type: String,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", alertSchema);

export default Notification;
