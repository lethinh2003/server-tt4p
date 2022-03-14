const mongoose = require("mongoose");
const validator = require("validator");
const ip = require("ip");
const HistoryCodeSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true,
    minlength: [6, "Content must lengths greater or equal 6"],
    required: [true, "Missing content"],
  },
  account: {
    type: String,
    trim: true,
    minlength: [6, "Account must lengths greater or equal 6"],
    required: [true, "Missing account"],
  },
  email: {
    type: String,
    tirm: true,
    required: [true, "Missing email"],
    validate: [validator.isEmail, "Email is not valid"],
  },
  ipAddress: {
    type: String,
  },
  code: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
    enum: ["pending", "success", "fail"],
    default: "pending",
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});
HistoryCodeSchema.pre("save", async function (next) {
  this.ipAddress = ip.address();
  next();
});
const HistoryCode = mongoose.models.HistoryCode || mongoose.model("HistoryCode", HistoryCodeSchema);
module.exports = HistoryCode;
