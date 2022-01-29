const Heart = require("../models/heart_model");
const User = require("../models/user_model");
const Music = require("../models/music_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
const AppError = require("../utils/app_error");
exports.getAllHearts = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.idMusic) {
    filter = { music: req.params.idMusic };
  }
  const heart = await Heart.find(filter);
  res.status(200).json({
    status: "success",
    data: {
      heart,
    },
  });
});
exports.getAllHeartsByUserId = catchAsync(async (req, res, next) => {
  const filter = { user: req.params.userId };
  const hearts = await Heart.find(filter);
  res.status(200).json({
    status: "success",
    data: {
      data: hearts,
    },
  });
});
exports.getHeart = factory.getOne(Heart);
exports.deleteHeart = factory.deleteOne(Heart);

exports.createHeart = catchAsync(async (req, res, next) => {
  if (!req.body.music) {
    req.body.music = req.params.idMusic;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  const checkUser = await User.findById(req.body.user);
  const checkMusic = await Music.findById(req.body.music);
  const checkUserHeartedMusic = await Heart.find({
    user: { $in: [req.body.user] },
    music: { $in: [req.body.music] },
  });
  if (checkUser && checkMusic) {
    if (checkUserHeartedMusic && checkUserHeartedMusic.length > 0) {
      return next(new AppError("You have hearted this music!", 401));
    }
    const newHeart = await Heart.create(req.body);
    res.status(201).json({
      status: "success",
      data: newHeart,
    });
  }
});
