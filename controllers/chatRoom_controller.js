const ChatRoom = require("../models/ChatRoom");
const ChatRoomRandom = require("../models/ChatRoomRandom");
const MessageRoomRandom = require("../models/MessageRoomRandom");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
exports.checkUserInRoom = catchAsync(async (req, res, next) => {
  const { account } = req.body;
  if (!account || req.user.account !== account) {
    return next(new AppError("Vui lòng nhập thông tin", 404));
  }
  const checkUser = await ChatRoom.findOne({ account: account }).select("account status partner room");
  if (checkUser) {
    return res.status(200).json({
      status: "success",
      message: "Tài khoản đang tham gia phòng chat.",
      data: checkUser,
      statusUser: checkUser.status,
    });
  }
  return res.status(200).json({
    status: "success",
    message: "Tài khoản chưa tham gia phòng chat nào.",
    statusUser: "",
  });
});
exports.checkRoom = catchAsync(async (req, res, next) => {
  const { accountID } = req.body;
  if (!accountID || req.user._id != accountID) {
    return next(new AppError("Vui lòng nhập thông tin", 404));
  }
  const checkUser = await ChatRoomRandom.findOneAndUpdate(
    { account: accountID },
    {},
    {
      new: true,
      upsert: true,
    }
  );
  if (checkUser.room) {
    return res.status(200).json({
      status: "success",
      message: "Tài khoản đang tham gia phòng chat.",
      data: checkUser,
    });
  } else {
    return res.status(200).json({
      status: "success",
      message: "Tài khoản chưa tham gia phòng chat nào.",
      data: checkUser,
    });
  }
});
exports.getMessages = catchAsync(async (req, res, next) => {
  const { room } = req.body;
  if (!room) {
    return next(new AppError("Vui lòng nhập thông tin", 404));
  }
  const msgs = await MessageRoomRandom.find({ room: room });
  return res.status(200).json({
    status: "success",
    data: msgs,
  });
});
exports.updateStatus = catchAsync(async (req, res, next) => {
  const { accountID } = req.body;
  if (!accountID || req.user._id != accountID) {
    return next(new AppError("Vui lòng nhập thông tin", 404));
  }
  await ChatRoomRandom.findOneAndUpdate(
    { account: accountID },
    {
      status: null,
    }
  );
  return res.status(200).json({
    status: "success",
  });
});
