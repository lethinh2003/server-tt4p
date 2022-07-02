const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const avatarUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Missing user"],
    },
    accessory: {
      type: String,
    },
    body: {
      type: String,
    },
    circleColor: {
      type: String,
    },
    clothing: {
      type: String,
    },
    clothingColor: {
      type: String,
    },
    eyebrows: {
      type: String,
    },
    eyes: {
      type: String,
    },
    faceMask: {
      type: Boolean,
      default: false,
    },
    faceMaskColor: {
      type: String,
    },
    facialHair: {
      type: String,
    },
    graphic: {
      type: String,
    },
    hair: {
      type: String,
    },
    hairColor: {
      type: String,
    },
    hat: {
      type: String,
    },
    hatColor: {
      type: String,
    },
    lashes: {
      type: Boolean,
      default: false,
    },
    lipColor: {
      type: String,
    },
    mask: {
      type: Boolean,
      default: false,
    },
    mouth: {
      type: String,
    },
    skinTone: {
      type: String,
    },
  },
  {
    collection: "avatar_user",
    timestamps: true,
  }
);
avatarUserSchema.methods.generateBoy = function () {
  this.accessory = "none";
  this.body = "chest";
  this.circleColor = "blue";
  this.clothing = "shirt";
  this.clothingColor = "black";
  this.eyebrows = "raised";
  this.eyes = "normal";
  this.faceMask = false;
  this.faceMaskColor = "black";
  this.facialHair = "none";
  this.graphic = "none";
  this.hair = "short";
  this.hairColor = "black";
  this.hat = "none2";
  this.hatColor = "white";
  this.lashes = false;
  this.lipColor = "pink";
  this.mask = false;
  this.mouth = "lips";
  this.skinTone = "light";
};
avatarUserSchema.methods.generateGirl = function () {
  this.accessory = "none";
  this.body = "breasts";
  this.circleColor = "blue";
  this.clothing = "shirt";
  this.clothingColor = "black";
  this.eyebrows = "raised";
  this.eyes = "normal";
  this.faceMask = false;
  this.faceMaskColor = "black";
  this.facialHair = "none";
  this.graphic = "none";
  this.hair = "long";
  this.hairColor = "black";
  this.hat = "none2";
  this.hatColor = "white";
  this.lashes = false;
  this.lipColor = "green";
  this.mask = false;
  this.mouth = "grin";
  this.skinTone = "light";
};
avatarUserSchema.methods.generateLGBT = function () {
  this.accessory = "none";
  this.body = "chest";
  this.circleColor = "blue";
  this.clothing = "tankTop";
  this.clothingColor = "black";
  this.eyebrows = "raised";
  this.eyes = "normal";
  this.faceMask = false;
  this.faceMaskColor = "black";
  this.facialHair = "none";
  this.graphic = "none";
  this.hair = "pixie";
  this.hairColor = "black";
  this.hat = "none2";
  this.hatColor = "white";
  this.lashes = false;
  this.lipColor = "purple";
  this.mask = false;
  this.mouth = "lips";
  this.skinTone = "light";
};

const AvatarUser = mongoose.models.AvatarUser || mongoose.model("AvatarUser", avatarUserSchema);
module.exports = AvatarUser;
