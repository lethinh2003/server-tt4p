const Notify = require("../models/Notify");
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

exports.createNotify = catchAsync(async (req, res, next) => {
  const { user_send, user_receive, content, user, post, post_comment, type } = req.body;
  if (!user_send || !user_receive || !content) {
    return next(new AppError("Vui lòng nhập đầy đủ thông tin", 404));
  }

  const result = await Notify.create({
    user_send,
    user_receive,
    content,
    user,
    post,
    type,
    post_comment,
  });

  return res.status(200).json({
    status: "success",
    data: result,
  });
});
exports.deleteNotify = catchAsync(async (req, res, next) => {
  const { user_send, user_receive, content, user, post, post_comment, type } = req.body;
  if (!user_send || !user_receive || !type) {
    return next(new AppError("Vui lòng nhập đầy đủ thông tin", 404));
  }

  const result = await Notify.findOneAndDelete({
    user_send,
    user_receive,
    user,
    post,
    type,
    post_comment,
  });

  return res.status(200).json({
    status: "success",
    data: result,
  });
});
exports.getUserNotifies = catchAsync(async (req, res, next) => {
  const { userID } = req.params;
  const page = req.query.page * 1 || 1;
  const pageSize = req.query.pageSize * 1 || 10;
  const skip = (page - 1) * pageSize;

  if (!userID || userID != req.user._id) {
    return next(new AppError("Vui lòng nhập ID người dùng", 404));
  }

  const getNotifies = await Notify.find({
    user_receive: userID,
  })
    .sort("-_id")
    .limit(pageSize)
    .skip(skip);

  return res.status(200).json({
    status: "success",
    results: getNotifies.length,
    data: getNotifies,
    meta: {
      page,
      pageSize,
    },
  });
});
exports.getUserNotifiesNumber = catchAsync(async (req, res, next) => {
  const { userID } = req.params;

  if (!userID || userID != req.user._id) {
    return next(new AppError("Vui lòng nhập ID người dùng", 404));
  }

  const getNotifies = await Notify.find({
    user_receive: userID,
    read: false,
  });

  return res.status(200).json({
    status: "success",
    results: getNotifies.length,
    data: getNotifies,
  });
});
