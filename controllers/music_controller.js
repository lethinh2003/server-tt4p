const Music = require("../models/music_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");

exports.getTopViewsDayMusics = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "info.views";
  next();
};
exports.getNewMusics = (req, res, next) => {
  req.query.limit = 10;
  req.query.sort = "-info.createdAt";
  next();
};

exports.getAllMusics = factory.getAll(Music);
exports.getMusic = factory.getOne(Music, {
  path: "hearts",
  select: "-__v -_id ",
});

exports.updateMusic = factory.updateOne(Music);
exports.deleteMusic = factory.deleteOne(Music);
exports.createMusic = factory.createOne(Music);
