const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema({
  author: {
    type: String,
  },
  author_image: {
    type: String,
  },
  zalo: {
    type: String,
  },
  facebook: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

const System = mongoose.models.System || mongoose.model("System", systemSchema);
module.exports = System;
