const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    post_comment: {
      type: mongoose.Schema.ObjectId,
      ref: "PostComment",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    user_send: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    user_receive: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
    content: {
      type: String,
      trim: true,
      required: [true, "Missing content"],
    },
  },
  {
    timestamps: true,
    collection: "notify",
  }
);
notifySchema.pre(/^find/, function (next) {
  this.populate({
    path: "user_send",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });
  this.populate({
    path: "user_receive",
    select:
      "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    populate: {
      path: "avatarSVG",
      model: "AvatarUser",
      select: "-user",
    },
  });
  this.populate({
    path: "post",
    select: "-__v",
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

const Notify = mongoose.models.Notify || mongoose.model("Notify", notifySchema);
module.exports = Notify;
