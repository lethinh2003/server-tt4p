const mongoose = require("mongoose");
const User = require("./User");
const NotifySchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true,
    minlength: [6, "Content must lengths greater or equal 6"],
    required: [true, "Missing content"],
  },
  link: {
    type: String,
    trim: true,
  },
  account_send: [
    {
      type: mongoose.Schema.ObjectId,
      ref: User,
      required: [true, "Missing account send"],
    },
  ],
  account_receive: [
    {
      type: mongoose.Schema.ObjectId,
      ref: User,
      required: [true, "Missing account receive"],
    },
  ],
  status: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const Notify = mongoose.models.Notify || mongoose.model("Notify", NotifySchema);
module.exports = Notify;
