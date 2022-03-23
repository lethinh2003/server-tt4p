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
  name: {
    type: String,
    trim: true,
    minlength: [2, "Name must lengths greater or equal 2"],
    required: [true, "Missing name"],
  },

  avatar: {
    type: String,
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
