const PostHeart = require("../models/PostHeart");
const PostActivity = require("../models/PostActivity");

const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
const validator = require("validator");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { json } = require("body-parser");

exports.createHeart = catchAsync(async (req, res, next) => {
  const { post } = req.body;
  if (!post) {
    return next(new AppError("Please fill in all field", 404));
  }
  const check_post = await Post.find({
    _id: post,
  });
  if (!check_post) {
    return next(new AppError("Post invalid", 404));
  }
  const check_user_hearted = await PostHeart.find({
    user: [req.user.id],
    post: [post],
  });

  //delete heart

  if (check_user_hearted.length > 0) {
    await Promise.all([
      Post.findByIdAndUpdate(post, {
        $pull: { hearts: check_user_hearted[0]._id },
        $inc: { hearts_count: -1 },
      }),
      PostHeart.findOneAndDelete({ post: { $in: [post] }, user: { $in: [req.user.id] } }),
    ]);

    return res.status(200).json({
      status: "success",
      message: "delete_success",
    });
  }
  //create heart
  const create_heart = await PostHeart.create({
    user: [req.user.id],
    post: [post],
  });
  await Promise.all([
    PostActivity.create({
      user: [req.user.id],
      post: [post],
    }),
    Post.findByIdAndUpdate(post, {
      $push: { hearts: create_heart._id },
      $inc: { hearts_count: 1 },
    }),
  ]);

  return res.status(200).json({
    status: "success",
    message: "create_success",
  });
});
exports.getDetailHearts = catchAsync(async (req, res, next) => {
  const { userID } = req.params;
  const hearts = await PostHeart.find({
    user: { $in: [userID] },
  })
    .select("-__v")
    .populate({
      path: "user",
      select:
        "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    });

  return res.status(200).json({
    status: "success",
    data: hearts,
  });
});
