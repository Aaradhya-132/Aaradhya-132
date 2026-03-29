import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
    content: {
      text: {
        type: String,
      },
      assetUrl: {
        type: String,
      },
      contentType: {
        type: String,
        enum: ["text", "image"],
        default: "text",
      },
    },
    expireAt: {
      type: Date,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
