const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  account: {
    type: String,
    unique: true,
    trim: true,
    minlength: [6, "Account must lengths greater or equal 6"],
    required: [true, "Missing account"],
  },
  password: {
    type: String,
    trim: true,
    minlength: [6, "Password must lengths greater or equal 6"],
    required: [true, "Missing password"],
  },
  confirmPassword: {
    type: String,
    trim: true,
    minlength: [6, "Confirm password must lengths greater or equal 6"],
    required: [true, "Missing confirm password"],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
    },
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "banned"],
    default: "active",
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});
userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
