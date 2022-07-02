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
    sortType = "createdAt";
    const getPostComments = await PostComment.find({
      post: { $in: [postId] },
    })
      .skip(skip)
      .limit(results)
      .sort(sortType);

    return res.status(200).json({
      status: "success",
      results: getPostComments.length,
      data: getPostComments,
    });
  } else if (req.query.sort === "popular") {
    sortType = { likes: -1, _id: -1 };
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
        path: "rep_comments",
        select: "-__v",
        populate: {
          path: "user",
          model: "User",
          select:
            "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date",
          populate: {
            path: "avatarSVG",
            model: "AvatarUser",
            select: "-user",
          },
        },
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
      });

    return res.status(200).json({
      status: "success",
      results: getPostComments.length,
      data: getPostComments,
    });
  }
});
exports.EditPostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId, content } = req.body;
  console.log(commentId);
  if (!userId || userId !== req.user.id || !commentId || !content) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const editComment = await PostComment.findByIdAndUpdate(commentId, {
    content: content,
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
  console.log(commentId);
  if (!userId || userId !== req.user.id || !commentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const deleteComment = await PostComment.findByIdAndDelete(commentId);
  await Post.findByIdAndUpdate(deleteComment.post[0], {
    $pull: { comments: deleteComment._id },
    $inc: { comments_count: -1 },
  });
  return res.status(200).json({
    status: "success",
    message: "Edit Success",
    data: deleteComment,
  });
});
exports.CreatePostComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const { userId, content } = req.body;
  if (!userId || userId !== req.user.id || !postId || !content) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const createComment = await PostComment.create({
    user: [req.user._id],
    post: [postId],

    content: content,
  });
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: createComment._id },
    $inc: { comments_count: 1 },
  });

  return res.status(200).json({
    status: "success",
    message: "Create Success",
    data: createComment,
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
