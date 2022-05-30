const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");
const slugify = require("slugify");
const postSchema = new mongoose.Schema({
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
    },
  ],
  comments: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "PostComment",
    },
  ],
  hearts: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "PostHeart",
    },
  ],

  hearts_count: {
    type: Number,
    default: 0,
  },
  comments_count: {
    type: Number,
    default: 0,
  },
  title: {
    type: String,
    trim: true,
    minlength: [5, "Title must lengths greater or equal 5"],
    required: [true, "Missing title"],
    unique: [true, "Title valid, please choose new title"],
  },
  content: {
    type: String,
    trim: true,
    minlength: [5, "Content must lengths greater or equal 5"],
    required: [true, "Missing content"],
  },
  color: {
    type: String,
  },
  slug: {
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
postSchema.pre("save", async function (next) {
  if (!this.color) {
    this.color = "#120c1c";
  }
  const year = new Date().getFullYear();
  let day = new Date().getDate();
  let month = new Date().getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  if (day < 10) {
    day = "0" + day;
  }
  this.slug = slugify(this.title, {
    lower: true,
  });
  this.slug = year + "/" + month + "/" + day + "/" + this.slug;

  next();
});
postSchema.pre("update", async function (next) {
  console.log("heheh");

  next();
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
module.exports = Post;
