const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const ip = require("ip");
const HistoryLikeSchema = new mongoose.Schema({
  account: {
    type: String,
    trim: true,
    minlength: [6, "Account must lengths greater or equal 6"],
    required: [true, "Missing account"],
  },
  comment: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
    },
  ],
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});
HistoryLikeSchema.pre("save", async function (next) {
  this.ipAddress = ip.address();
  next();
});
const HistoryLike = mongoose.models.HistoryLike || mongoose.model("HistoryLike", HistoryLikeSchema);
module.exports = HistoryLike;
