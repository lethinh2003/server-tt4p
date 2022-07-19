const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
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
      default: "https://i.imgur.com/d5Jfipa.png",
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
    partners: {
      type: Number,
      default: 0,
    },
    messages: {
      type: Number,
      default: 0,
    },
    banned_reason: {
      type: String,
    },
    hideInfo: {
      type: Boolean,
      default: true,
    },
    avatarSVG: {
      type: mongoose.Schema.ObjectId,
      ref: "AvatarUser",
    },

    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    refreshToken: String,
    accessToken: String,

    emailActiveToken: String,
    emailActiveTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    updatedPasswordAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  next();
});
userSchema.methods.correctPassword = async function (candidatePassword, password) {
  return await bcrypt.compare(candidatePassword, password);
};
userSchema.methods.createActiveEmailToken = async function (num) {
  const token = await crypto.randomBytes(num).toString("hex");
  this.emailActiveToken = await crypto.createHash("sha256").update(token).digest("hex");
  this.emailActiveTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};
userSchema.methods.createResetPasswordToken = async function (num) {
  const token = await crypto.randomBytes(num).toString("hex");
  this.resetPasswordToken = await crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
