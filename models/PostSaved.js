const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const postSavedSchema = new mongoose.Schema(
  {
    post: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Post",
        required: [true, "Missing post"],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Missing user"],
      },
    ],
  },
  {
    collection: "post_saved",
    timestamps: true,
  }
);

postSavedSchema.pre(/^find/, function (next) {
  this.populate({
    path: "post",
    select: "-__v",
    populate: {
      path: "user",
      select:
        "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      populate: {
        path: "avatarSVG",
        model: "AvatarUser",
        select: "-user",
      },
    },
  });
  this.populate({
    path: "user",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });

  next();
});
const PostSaved = mongoose.models.PostSaved || mongoose.model("PostSaved", postSavedSchema);
module.exports = PostSaved;
