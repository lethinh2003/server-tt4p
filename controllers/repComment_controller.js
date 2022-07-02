const Post = require("../models/Post");
const PostComment = require("../models/PostComment");
const PostRepComment = require("../models/PostRepComment");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
exports.uploadFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded!", 404));
  }
  return res.status(200).json({
    status: "success",
    data: req.file.path,
  });
});

exports.CreateRepPostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId, content, postId } = req.body;
  if (!userId || userId !== req.user.id || !commentId || !content) {
    return next(new AppError("Please fill in all fields", 404));
  }

  const createRepComment = await PostComment.create({
    user: [req.user._id],
    post: [postId],
    content: content,
    parent_comment: commentId,
  });
  await PostComment.findOneAndUpdate(
    {
      _id: commentId,
    },
    {
      $push: { rep_comments: createRepComment._id },
    }
  );

  return res.status(200).json({
    status: "success",
    message: "Create Success",
    data: createRepComment,
  });
});
exports.CreateLikePostRepComment = catchAsync(async (req, res, next) => {
  const { repCommentId } = req.params;
  const { userId } = req.body;
  if (!userId || userId !== req.user.id || !repCommentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const check_user_liked_comment = await PostRepComment.find({ _id: repCommentId, likes: { $in: [userId] } });
  if (check_user_liked_comment.length > 0) {
    await PostRepComment.findOneAndUpdate(
      {
        _id: repCommentId,
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
    await PostRepComment.findOneAndUpdate(
      {
        _id: repCommentId,
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
exports.CreateDislikePostRepComment = catchAsync(async (req, res, next) => {
  const { repCommentId } = req.params;
  const { userId } = req.body;
  if (!userId || userId !== req.user.id || !repCommentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const check_user_disliked_comment = await PostRepComment.find({ _id: repCommentId, dislikes: { $in: [userId] } });
  if (check_user_disliked_comment.length > 0) {
    await PostRepComment.findOneAndUpdate(
      {
        _id: repCommentId,
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
    await PostRepComment.findOneAndUpdate(
      {
        _id: repCommentId,
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
exports.EditPostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;

  if (!userId || userId !== req.user.id || !commentId || !content) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const editComment = await PostRepComment.findByIdAndUpdate(commentId, {
    content: content,
  }).populate({
    path: "comment",
    select: "-__v",
  });
  return res.status(200).json({
    status: "success",
    message: "Edit Success",
    data: editComment,
  });
});
exports.DeletePostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  if (!userId || userId !== req.user.id || !commentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const deleteComment = await PostRepComment.findByIdAndDelete(commentId).populate({
    path: "comment",
    select: "-__v",
  });

  await PostComment.findByIdAndUpdate(deleteComment.comment[0].post[0], {
    $pull: { rep_comments: deleteComment._id },
  });
  return res.status(200).json({
    status: "success",
    message: "Edit Success",
    data: deleteComment,
  });
});
