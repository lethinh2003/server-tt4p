const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  account: {
    type: String,
    unique: true,
    trim: true,
    minlength: [5, "Account must lengths greater or equal 5"],
    required: [true, "Missing account"],
  },
  password: {
    type: String,
    trim: true,
    minlength: [1, "Password must lengths greater or equal 1"],
    required: [true, "Missing password"],
  },
  name: {
    type: String,
    trim: true,
    minlength: [2, "Name must lengths greater or equal 2"],
    required: [true, "Missing name"],
  },
  city: {
    type: String,
    required: [true, "Missing city"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Missing email"],
    trim: true,
    validate: [validator.isEmail, "Email is invalid"],
  },

  bio: {
    type: String,
  },
  date: {
    type: Number,
    min: [1950, "Date is invalid"],
    max: [new Date().getFullYear(), "Date is invalid"],
  },

  avatar: {
    type: String,
  },
  sex: {
    type: String,
    enum: ["boy", "girl", "lgbt"],
    required: [true, "Missing sex"],
  },
  findSex: {
    type: String,
    enum: ["boy", "girl", "lgbt"],
    required: [true, "Missing findSex"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status: {
    type: Boolean,
    default: true,
  },
  active_email: {
    type: Boolean,
    default: false,
  },
  banned_reason: {
    type: String,
  },
  hideInfo: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  emailActiveToken: String,
  emailActiveTokenExpires: Date,
});
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.createActiveEmailToken = async function (num) {
  const token = await crypto.randomBytes(num).toString("hex");
  this.emailActiveToken = await crypto.createHash("sha256").update(token).digest("hex");
  this.emailActiveTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
