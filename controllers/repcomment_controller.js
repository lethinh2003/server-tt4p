const Comment = require("../models/Comment");
const HistoryLike = require("../models/HistoryLike");
const RepComment = require("../models/RepComment");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");

exports.getComments = catchAsync(async (req, res, next) => {
  try {
    const id = req.user._id;
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;

    const findComments = await RepComment.find({
      user: { $in: [id] },
    })
      .skip(skip)
      .limit(results)
      .populate({
        path: "user",
        select: "-__v -password",
      })

      .populate({
        path: "comment",
        select: "-__v",
      })
      .sort("-_id")
      .select("-__v");
    return res.status(200).json({
      time: req.timeNow,
      length: findComments.length,
      status: "success",
      data: findComments,
    });
  } catch (err) {
    console.log(err);
  }
});
exports.deleteComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { commentId } = req.body;
  const deleteReply = RepComment.findOneAndDelete({
    _id: commentId,
    user: { $in: [id] },
  });
  const deleteCmt = Comment.findOneAndUpdate(
    { reply: { $in: [commentId] } },
    { $pull: { reply: { $in: [commentId] } } }
  );
  await Promise.all([deleteCmt, deleteReply]);
  return res.status(204).end();
});
