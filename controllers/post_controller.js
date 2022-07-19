const Post = require("../models/Post");
const PostActivity = require("../models/PostActivity");
const PostComment = require("../models/PostComment");
const PostRepComment = require("../models/PostRepComment");
const PostHeart = require("../models/PostHeart");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
const validator = require("validator");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { json } = require("body-parser");
exports.uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded!", 404));
  }
  return res.status(200).json({
    status: "success",
    data: req.file.path,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content, color } = req.body;
  if (!title || !content) {
    return next(new AppError("Please fill in all field", 404));
  }

  const createPost = await Post.create({
    user: req.user.id,
    title,
    content,
    color,
  });

  return res.status(200).json({
    status: "success",
    data: createPost,
  });
});
exports.getDetailPost = catchAsync(async (req, res, next) => {
  const { postID } = req.params;
  if (!postID) {
    return next(new AppError("Please fill in post ID", 404));
  }

  const getPost = await Post.findOne({
    _id: postID,
  });

  return res.status(200).json({
    status: "success",
    data: getPost,
  });
});
exports.deleteDetailPost = catchAsync(async (req, res, next) => {
  const { postID } = req.body;
  if (!postID) {
    return next(new AppError("Please fill in post ID", 404));
  }

  const getPost = await Post.findOneAndDelete({
    _id: postID,
    user: { $in: [req.user.id] },
  });
  if (!getPost) {
    return next(new AppError("Có lỗi xảy ra!", 404));
  }
  return res.status(200).json({
    status: "success",
  });
});
exports.setStatusDetailPost = catchAsync(async (req, res, next) => {
  const { postID, status } = req.body;
  if (!postID) {
    return next(new AppError("Please fill in post ID", 404));
  }

  const getPost = await Post.findOneAndUpdate(
    {
      _id: postID,
      user: { $in: [req.user.id] },
    },
    { status: status }
  );
  if (!getPost) {
    return next(new AppError("Có lỗi xảy ra!", 404));
  }
  return res.status(200).json({
    status: "success",
  });
});
exports.getDetailPostBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.body;

  if (!slug) {
    return next(new AppError("Please fill in slug", 404));
  }

  const getPost = await Post.findOne({
    slug: slug,
  })
    .populate({
      path: "user",
      select:
        "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      populate: {
        path: "avatarSVG",
        model: "AvatarUser",
        select: "-user",
      },
    })
    .populate({
      path: "hearts",
      select: "-__v",
    });
  getPost.updateCommentsCount();
  await getPost.save();

  return res.status(200).json({
    status: "success",
    data: getPost,
  });
});
exports.getDetailPostActivity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId || userId !== req.user.id) {
    return next(new AppError("Please fill in user Id", 404));
  }

  const getPostActivity = await PostActivity.find({
    user: { $in: [req.user.id] },
  }).sort({ _id: 1 });

  return res.status(200).json({
    status: "success",
    data: getPostActivity,
  });
});
exports.getDetailPostHearts = catchAsync(async (req, res, next) => {
  const { postID } = req.params;
  const getPost = await Post.findOne({
    _id: postID,
  });

  return res.status(200).json({
    status: "success",
    data: getPost ? getPost.hearts.length : 0,
  });
});
exports.deleteDetailPostActivity = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { postId } = req.body;
  if (!userId || userId !== req.user.id || !postId) {
    return next(new AppError("Please fill in all fields", 404));
  }

  const getPostActivity = await PostActivity.findOneAndDelete({
    user: { $in: [req.user.id] },
    post: { $in: [postId] },
  });

  return res.status(200).json({
    status: "success",
  });
});
exports.getAllPosts = catchAsync(async (req, res, next) => {
  const pageSize = req.query.pageSize * 1 || 5;
  const postId = req.query.postId;
  const page = req.query.page * 1 || 1;
  const results = req.query.results * 1 || 5;
  const skip = (page - 1) * pageSize;
  let sortType = "_id";
  let posts;
  if (req.query.sort === "all") {
    sortType = "_id";
  } else if (req.query.sort === "latest") {
    sortType = "-createdAt";
  } else if (req.query.sort === "popular") {
    sortType = { hearts_count: -1, _id: -1 };
  }
  if (req.query.sort !== "following" && req.query.sort !== "popular") {
    let post_hearts = 0;
    let post_comments = 0;

    if (postId) {
      if (req.query.sort === "all") {
        posts = await Post.find({ _id: { $gt: postId } })
          .limit(pageSize)
          .sort(sortType)
          .select("-__v")
          .populate({
            path: "user",
            select: "-password",
            populate: {
              path: "avatarSVG",
              model: "AvatarUser",
              select: "-user",
            },
          })
          .populate({
            path: "hearts",
            select: "-__v",
          });
      } else if (req.query.sort === "latest") {
        posts = await Post.find({ _id: { $lt: postId } })
          .limit(pageSize)
          .sort(sortType)
          .select("-__v")
          .populate({
            path: "user",
            select: "-password",
            populate: {
              path: "avatarSVG",
              model: "AvatarUser",
              select: "-user",
            },
          })
          .populate({
            path: "hearts",
            select: "-__v",
          });
      }
    } else {
      posts = await Post.find({})
        .limit(pageSize)
        .sort(sortType)
        .select("-__v")
        .populate({
          path: "user",
          select: "-password",
          populate: {
            path: "avatarSVG",
            model: "AvatarUser",
            select: "-user",
          },
        })
        .populate({
          path: "hearts",
          select: "-__v",
        });
    }
    return res.status(200).json({
      status: "success",
      results: posts.length,
      page: page,
      pageSize: pageSize,

      data: posts,
    });
  } else {
    if (req.query.sort === "popular") {
      posts = await Post.find({})
        .skip(skip)
        .limit(pageSize)
        .sort(sortType)
        .select("-__v")
        .populate({
          path: "user",
          select: "-password",
          populate: {
            path: "avatarSVG",
            model: "AvatarUser",
            select: "-user",
          },
        })
        .populate({
          path: "hearts",
          select: "-__v",
        });
    } else if (req.query.sort === "following") {
      posts = await Post.find({ user: { $in: req.user.following } })
        .skip(skip)
        .limit(pageSize)
        .sort("-createdAt")
        .select("-__v")
        .populate({
          path: "user",
          select: "-password",
          populate: {
            path: "avatarSVG",
            model: "AvatarUser",
            select: "-user",
          },
        })
        .populate({
          path: "hearts",
          select: "-__v",
        });
    }
    return res.status(200).json({
      status: "success",
      results: posts.length,
      page: page,
      pageSize: pageSize,
      data: posts,
    });
  }
});
