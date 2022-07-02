const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const chatRoomSchema = new mongoose.Schema(
  {
    account: {
      type: String,
      trim: true,
      required: [true, "Missing account"],
    },
    partner: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      required: [true, "Missing status"],
    },
  },
  {
    collection: "chat-room",
    timestamps: true,
  }
);

const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
