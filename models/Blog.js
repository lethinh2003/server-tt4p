const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const keyword_extractor = require("keyword-extractor");

const BlogSchema = new mongoose.Schema({
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
  images: {
    type: Array,
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
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
  updatedAt: {
    type: String,
  },
});
// CodeSchema.pre(/^find/, async function (next) {
//   const text = keyword_extractor.extract("Haha le thinh pro", {
//     language: "english",
//     remove_digits: true,
//     return_changed_case: true,
//     remove_duplicates: false,
//   });
//   console.log(text);
//   next();
// });

BlogSchema.pre("save", async function (next) {
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
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
module.exports = Blog;
