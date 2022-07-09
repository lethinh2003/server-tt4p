const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      trim: true,
      required: [true, "Missing room"],
    },
    from: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing account from"],
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing account to"],
    },
    msg: {
      type: String,
      trim: true,
      required: [true, "Missing msg"],
    },
  },
  {
    collection: "chat_message",
    timestamps: true,
  }
);

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
module.exports = Message;
