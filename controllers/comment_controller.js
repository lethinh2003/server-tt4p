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
    sortType = "-createdAt";
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
      .sort(sortType);

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
  if (!userId || userId !== req.user.id || !commentId || !content) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const editComment = await PostComment.findByIdAndUpdate(
    commentId,
    {
      content: content,
    },
    {
      new: false,
      upsert: false,
    }
  );
  if (!editComment) {
    return next(new AppError("This content is invalid!", 404));
  }
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
  const checkValidComment = await PostComment.findOne({
    _id: commentId,
  });
  if (!checkValidComment) {
    return next(new AppError("This content is invalid!", 404));
  }
  const findReplyComments = await PostComment.find({
    parent_comment: commentId,
  });
  const getReplyCommentsId = findReplyComments.map((item) => item._id);
  const listCommentsNeedDelete = [checkValidComment._id].concat(getReplyCommentsId);
  await Promise.all([
    Post.findByIdAndUpdate(checkValidComment.post[0], {
      $pull: { comments: { $in: listCommentsNeedDelete } },
      $inc: { comments_count: -listCommentsNeedDelete.length },
    }),
    PostComment.deleteMany({
      parent_comment: commentId,
    }),
    PostComment.deleteOne({
      _id: commentId,
    }),
  ]);

  return res.status(200).json({
    status: "success",
    message: "Delete Success",
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
  const checkCommentIsValid = await PostComment.findOne({
    _id: commentId,
  });
  if (!checkCommentIsValid) {
    return next(new AppError("This content is invalid!", 404));
  }
  const listUsersLike = checkCommentIsValid.likes;
  // DISLIKE
  if (listUsersLike.includes(userId)) {
    const result = await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $pull: { likes: userId },
        $push: { dislikes: userId },
      },
      {
        new: true,
      }
    );
    const dataSendClient = {
      room: `post_comment_${commentId}`,
      commentId: commentId,
      userId: userId,
      likes: result.likes.length,
      dislikes: result.dislikes.length,
      type: "dislike",
    };
    _io.to(dataSendClient.room).emit("update-reaction-post-comment", dataSendClient);
    return res.status(200).json({
      status: "success",
      message: "delete_success",
      data: result,
    });
  } else {
    // LIKE

    const result = await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $push: { likes: userId },
        $pull: { dislikes: userId },
      },
      {
        new: true,
      }
    );
    const dataSendClient = {
      room: `post_comment_${commentId}`,
      commentId: commentId,
      userId: userId,
      likes: result.likes.length,
      dislikes: result.dislikes.length,
      type: "like",
    };
    _io.to(dataSendClient.room).emit("update-reaction-post-comment", dataSendClient);
    return res.status(200).json({
      status: "success",
      message: "create_success",
      data: result,
    });
  }
});
exports.CreateDislikePostComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  const { userId } = req.body;
  if (!userId || userId !== req.user.id || !commentId) {
    return next(new AppError("Please fill in all fields", 404));
  }
  const checkCommentIsValid = await PostComment.findOne({
    _id: commentId,
  });
  if (!checkCommentIsValid) {
    return next(new AppError("This content is invalid!", 404));
  }
  const listUsersDislike = checkCommentIsValid.dislikes;
  // DISLIKE
  if (listUsersDislike.includes(userId)) {
    const result = await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $push: { likes: userId },
        $pull: { dislikes: userId },
      },
      {
        new: true,
      }
    );
    const dataSendClient = {
      room: `post_comment_${commentId}`,
      commentId: commentId,
      userId: userId,
      likes: result.likes.length,
      dislikes: result.dislikes.length,
      type: "like",
    };
    _io.to(dataSendClient.room).emit("update-reaction-post-comment", dataSendClient);

    return res.status(200).json({
      status: "success",
      message: "delete_success",
      data: result,
    });
  } else {
    // LIKE

    const result = await PostComment.findOneAndUpdate(
      {
        _id: commentId,
      },
      {
        $pull: { likes: userId },
        $push: { dislikes: userId },
      },
      {
        new: true,
      }
    );
    const dataSendClient = {
      room: `post_comment_${commentId}`,
      commentId: commentId,
      userId: userId,
      likes: result.likes.length,
      dislikes: result.dislikes.length,
      type: "dislike",
    };
    _io.to(dataSendClient.room).emit("update-reaction-post-comment", dataSendClient);

    return res.status(200).json({
      status: "success",
      message: "create_success",
      data: result,
    });
  }
});
