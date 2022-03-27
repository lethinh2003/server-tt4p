const mongoose = require("mongoose");
const Comment = require("./Comment");
const User = require("./User");
const HistoryLikeSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: User,
      required: [true, "Missing user"],
    },
  ],
  comment: [
    {
      type: mongoose.Schema.ObjectId,
      ref: Comment,
      required: [true, "Missing comment"],
    },
  ],
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const HistoryLike = mongoose.models.HistoryLike || mongoose.model("HistoryLike", HistoryLikeSchema);
module.exports = HistoryLike;
