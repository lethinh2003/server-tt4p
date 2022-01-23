const Heart = require("../models/heartmodel");
const User = require("../models/usermodel");
const Music = require("../models/musicmodel");
const catchAsync = require("../utils/catchasync");
const factory = require("./handlefactory");
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
  const checkUserHeartedMusic = await Heart.findById({
    user: [req.body.user],
    music: [req.body.music],
  });
  if (checkUser && checkMusic && !checkUserHeartedMusic) {
    const newHeart = await Heart.create(req.body);
    res.status(201).json({
      status: "success",
      data: newHeart,
    });
  }
});
