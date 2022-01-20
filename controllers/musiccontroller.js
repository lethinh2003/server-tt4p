const Music = require("../models/musicmodel");
const catchAsync = require("../utils/catchasync");
const factory = require("./handlefactory");

exports.getTopViewsDayMusics = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "info.views";
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
