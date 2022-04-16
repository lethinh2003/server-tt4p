const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const chatRoomSchema = new mongoose.Schema({
  account: {
    type: String,
    trim: true,
    required: [true, "Missing account"],
  },
  type: {
    type: String,
    trim: true,
    required: [true, "Missing type"],
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const ChatRoom = mongoose.models.ChatRoom || mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
