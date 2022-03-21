const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");

const SystemSchema = new mongoose.Schema({
  myself_name: {
    type: String,
    trim: true,
    minlength: [2, "My self name must lengths greater or equal 2"],
    required: [true, "Missing My self name"],
  },
  myself_desc: {
    type: String,
    trim: true,
    minlength: [2, "My self desc must lengths greater or equal 2"],
    required: [true, "Missing My self desc"],
  },
  myself_avatar: {
    type: String,
    tirm: true,
    required: [true, "Missing link avatar"],
    validate: [validator.isURL, "Avatar is not valid"],
  },
  myself_fb: {
    type: String,
    tirm: true,
    required: [true, "Missing link fb"],
    validate: [validator.isURL, "FB is not valid"],
  },
  myself_fb_name: {
    type: String,
    tirm: true,
    required: [true, "Missing name fb"],
    validate: [validator.isURL, "FB is not valid"],
  },
  myself_zalo: {
    type: String,
    tirm: true,
    required: [true, "Missing link zalo"],
    validate: [validator.isURL, "Zalo is not valid"],
  },
  myself_zalo_name: {
    type: String,
    tirm: true,
    required: [true, "Missing name zalo"],
    validate: [validator.isURL, "Zalo is not valid"],
  },
  myself_instagram: {
    type: String,
    tirm: true,
    required: [true, "Missing link instagram"],
    validate: [validator.isURL, "Instagram is not valid"],
  },
  myself_email: {
    type: String,
    tirm: true,
    required: [true, "Missing email"],
    validate: [validator.isEmail, "Email is not valid"],
  },
  home_logo: {
    type: String,
    tirm: true,
    required: [true, "Missing link logo"],
    validate: [validator.isURL, "Logo is not valid"],
  },
  home_status: {
    type: Boolean,
    default: true,
  },
  home_views: {
    type: Number,
    default: 0,
  },
  home_express1: {
    type: Number,
    default: 0,
  },
  home_express2: {
    type: Number,
    default: 0,
  },
  home_express3: {
    type: Number,
    default: 0,
  },
  home_express4: {
    type: Number,
    default: 0,
  },
  home_discount: {
    type: Number,
    default: 0,
  },
  meta_title: {
    type: String,
    unique: true,
    trim: true,
    minlength: [6, "Meta Title must lengths greater or equal 6"],
    required: [true, "Missing meta title"],
  },
  meta_keywords: {
    type: String,
    unique: true,
    trim: true,
    minlength: [6, "Meta Keywords must lengths greater or equal 6"],
    required: [true, "Missing meta keywords"],
  },
  meta_desc: {
    type: String,
    unique: true,
    trim: true,
    minlength: [6, "Meta desc must lengths greater or equal 6"],
    required: [true, "Missing meta desc"],
  },
  meta_author: {
    type: String,
    unique: true,
    trim: true,
    minlength: [2, "Meta author must lengths greater or equal 2"],
    required: [true, "Missing meta author"],
  },
  meta_thumbnail: {
    type: String,
    tirm: true,
    required: [true, "Missing link meta thumbnail"],
    validate: [validator.isURL, "Meta thumbnail is not valid"],
  },
});

const System = mongoose.models.System || mongoose.model("System", SystemSchema);
module.exports = System;
