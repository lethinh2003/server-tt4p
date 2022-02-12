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
exports.deleteHeart = catchAsync(async (req, res, next) => {
  const checkUser = User.findById(req.user._id);
  const checkMusic = Music.findById(req.body.music);
  const checkUserHeartedMusic = Heart.find({
    user: { $in: [req.user._id] },
    music: { $in: [req.body.music] },
  });

  await Promise.all([checkUser, checkMusic, checkUserHeartedMusic]).then(async (data) => {
    if (data[2].length === 0) {
      return next(new AppError("You haven't hearted this music before!", 401));
    }
    const newHeart = await Heart.deleteOne({
      user: { $in: [req.user._id] },
      music: { $in: [req.body.music] },
    });
    res.status(201).json({
      status: "success",
      message: "Delete success",
    });
  });
});
exports.createHeart = catchAsync(async (req, res, next) => {
  if (!req.body.music) {
    req.body.music = req.params.idMusic;
  }
  req.body.user = req.user._id;

  const checkUser = User.findById(req.body.user);
  const checkMusic = Music.findById(req.body.music);
  const checkUserHeartedMusic = Heart.find({
    user: { $in: [req.body.user] },
    music: { $in: [req.body.music] },
  });

  await Promise.all([checkUser, checkMusic, checkUserHeartedMusic]).then(async (data) => {
    if (data[2].length > 0) {
      return next(new AppError("You have hearted this music!", 401));
    }
    const newHeart = await Heart.create(req.body);
    res.status(201).json({
      status: "success",
      data: newHeart,
    });
  });

  // if (checkUser && checkMusic) {
  //   if (checkUserHeartedMusic && checkUserHeartedMusic.length > 0) {
  //     return next(new AppError("You have hearted this music!", 401));
  //   }
  //   // const newHeart = await Heart.create(req.body);
  //   res.status(201).json({
  //     status: "success",
  //     data: newHeart,
  //   });
  // }
});
