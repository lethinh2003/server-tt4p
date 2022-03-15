const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const keyword_extractor = require("keyword-extractor");

const CodeSchema = new mongoose.Schema({
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
  desc: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  keywords: {
    type: Array,
    trim: true,
  },
  labels: {
    type: Array,
    trim: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
  },
});

CodeSchema.pre("save", async function (next) {
  const year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  this.slug = slugify(this.title, {
    lower: true,
  });
  this.slug = year + "/" + month + "/" + this.slug;

  this.keywords = keyword_extractor.extract(this.desc, {
    language: "english",
    remove_digits: true,
    return_changed_case: true,
    remove_duplicates: false,
  });
  next();
});
const Code = mongoose.models.Code || mongoose.model("Code", CodeSchema);
module.exports = Code;
