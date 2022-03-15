const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const sourceSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    trim: true,
    minlength: [6, "Title must lengths greater or equal 6"],
    required: [true, "Missing title"],
  },
  content: {
    type: String,
    trim: true,
    minlength: [6, "Content must lengths greater or equal 6"],
    required: [true, "Missing content"],
  },
  link: {
    type: String,
    tirm: true,
    required: [true, "Missing link download"],
    validate: [validator.isURL, "Link is not valid"],
  },
  images: {
    type: Array,
  },
  costs: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});
sourceSchema.pre("save", async function (next) {
  const year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  this.slug = slugify(this.title, {
    lower: true,
  });
  this.slug = year + "/" + month + "/source-code/" + this.slug;
  next();
});
const Source = mongoose.models.Source || mongoose.model("Source", sourceSchema);
module.exports = Source;
