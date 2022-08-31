const PostHeart = require("../models/PostHeart");
const PostActivity = require("../models/PostActivity");
const Post = require("../models/Post");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");

exports.createHeart = catchAsync(async (req, res, next) => {
  const { postID } = req.body;
  if (!postID) {
    return next(new AppError("Please fill in post ID", 404));
  }

  const check_user_hearted = await PostHeart.findOne({
    user: [req.user.id],
    post: [postID],
  });

  if (check_user_hearted) {
    //delete heart
    const data = await Promise.all([
      Post.findByIdAndUpdate(
        postID,
        {
          $pull: { hearts: check_user_hearted._id },
          $inc: { hearts_count: -1 },
        },
        { new: true }
      ).select("hearts_count hearts"),
      PostHeart.findOneAndDelete({ post: { $in: [postID] }, user: { $in: [req.user.id] } }),
    ]);
    return res.status(200).json({
      status: "success",
      message: "delete_success",
      data: data[0],
      meta: {
        postID,
      },
    });
  }
  //create heart
  const create_heart = await PostHeart.create({
    user: [req.user.id],
    post: [postID],
  });
  const data = await Promise.all([
    PostActivity.create({
      user: [req.user.id],
      post: [postID],
    }),
    Post.findByIdAndUpdate(
      postID,
      {
        $push: { hearts: create_heart._id },
        $inc: { hearts_count: 1 },
      },
      {
        new: true,
      }
    ).select("hearts_count hearts"),
  ]);

  return res.status(200).json({
    status: "success",
    message: "create_success",
    data: data[1],
    meta: {
      postID,
    },
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
        "role status name account sex createdAt following followers avatar partners messages avatarSVG city bio cover_background",
    });

  return res.status(200).json({
    status: "success",
    data: hearts,
    meta: {
      userID,
    },
  });
});
