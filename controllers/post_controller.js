const Post = require("../models/Post");
const PostActivity = require("../models/PostActivity");
const PostComment = require("../models/PostComment");
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
    })
    .populate({
      path: "hearts",
      select: "-__v",
    });

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
  })
    .sort({ _id: -1 })
    .populate({
      path: "post",
      select: "-__v",
      populate: {
        path: "user",
        model: "User",
        select:
          "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      },
    })

    .populate({
      path: "user",
      select:
        "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
    });

  return res.status(200).json({
    status: "success",
    data: getPostActivity,
  });
});
exports.getDetailPostComments = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const page = req.query.page * 1 || 1;
  const results = req.query.results * 1 || 10;
  const skip = (page - 1) * results;
  if (!postId) {
    return next(new AppError("Vui lòng nhập post ID", 404));
  }
  let sortType = "_id";
  if (req.query.sort === "latest") {
    sortType = "-createdAt";
    const getPostComments = await PostComment.find({
      post: { $in: [postId] },
    })
      .skip(skip)
      .limit(results)
      .sort(sortType)
      .populate({
        path: "post",
        select: "-__v",
      })
      .populate({
        path: "user",
        select:
          "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      });

    return res.status(200).json({
      status: "success",
      data: getPostComments,
    });
  } else if (req.query.sort === "popular") {
    sortType = "-likes";
    const getPostComments = await PostComment.find({
      post: { $in: [postId] },
    })
      .skip(skip)
      .limit(results)
      .sort(sortType)
      .populate({
        path: "post",
        select: "-__v",
      })
      .populate({
        path: "user",
        select:
          "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      });

    return res.status(200).json({
      status: "success",
      data: getPostComments,
    });
  }
});
exports.CreatePostComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  if (!userId || userId !== req.user.id || !postId || !content) {
    return next(new AppError("Please fill in all fields", 404));
  }
  await PostComment.create({
    user: [req.user._id],
    post: [postId],

    content: content,
  });

  return res.status(200).json({
    status: "success",
    message: "Create Success",
  });
});
exports.CreateLikePostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  if (!userId || userId !== req.user.id || !commentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const check_user_liked_comment = await PostComment.find({ _id: commentId, likes: { $in: [userId] } });
  if (check_user_liked_comment.length > 0) {
    await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $pull: { likes: userId },
      }
    );
    return res.status(200).json({
      status: "success",
      message: "delete_success",
    });
  } else {
    await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $push: { likes: userId },
      }
    );

    return res.status(200).json({
      status: "success",
      message: "create_success",
    });
  }
});
exports.CreateDislikePostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  if (!userId || userId !== req.user.id || !commentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const check_user_disliked_comment = await PostComment.find({ _id: commentId, dislikes: { $in: [userId] } });
  if (check_user_disliked_comment.length > 0) {
    await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $pull: { dislikes: userId },
      }
    );
    return res.status(200).json({
      status: "success",
      message: "delete_success",
    });
  } else {
    await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $push: { dislikes: userId },
      }
    );

    return res.status(200).json({
      status: "success",
      message: "create_success",
    });
  }
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
  const page = req.query.page * 1 || 1;
  const results = req.query.results * 1 || 10;
  const skip = (page - 1) * results;
  let sortType = "_id";
  if (req.query.sort !== "following") {
    if (req.query.sort === "all") {
      sortType = "_id";
    } else if (req.query.sort === "latest") {
      sortType = "-createdAt";
    } else if (req.query.sort === "popular") {
      sortType = "-hearts_count";
    }

    let post_hearts = 0;
    let post_comments = 0;

    const posts = await Post.find({})
      .skip(skip)
      .limit(results)
      .sort(sortType)
      .select("-__v")
      .populate({
        path: "user",
        select:
          "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      })
      .populate({
        path: "hearts",
        select: "-__v",
      });

    return res.status(200).json({
      status: "success",
      result: posts.length,
      page: page,

      data: posts,
    });
  } else {
    const posts = await Post.find({ user: { $in: req.user.following } })
      .skip(skip)
      .limit(results)
      .sort("-createdAt")
      .select("-__v")
      .populate({
        path: "user",
        select:
          "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
      })
      .populate({
        path: "hearts",
        select: "-__v",
      });

    return res.status(200).json({
      status: "success",
      result: posts.length,
      page: page,

      data: posts,
    });
  }
});
