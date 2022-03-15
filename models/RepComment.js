const mongoose = require("mongoose");

const repCommentSchema = new mongoose.Schema(
  {
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Missing user"],
      },
    ],
    content: {
      type: String,
      trim: true,
      minlength: [5, "content must lengths greater or equal 5"],
      required: [true, "Missing content"],
    },
    content: {
      type: String,
      trim: true,
      minlength: [5, "Content must lengths greater or equal 5"],
      required: [true, "Missing content"],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
repCommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "-__v -password",
  });
  next();
});

const RepComment = mongoose.models.RepComment || mongoose.model("RepComment", repCommentSchema);
module.exports = RepComment;
