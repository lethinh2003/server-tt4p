const ChatRoom = require("../models/ChatRoom");
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
