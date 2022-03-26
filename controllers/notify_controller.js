const Notify = require("../models/Notify");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");

// exports.updateUser = catchAsync(async (req, res, next) => {
//   const id = req.user._id;
//   const body = {
//     avatar: req.body.avatar,
//     name: req.body.name,
//   };
//   const user = await User.findByIdAndUpdate(id, body, {
//     new: true,
//     runValidators: true,
//   }).select("-password -__v ");

//   if (!user) {
//     return next(new AppError("No user updated!", 404));
//   }
//   return res.status(200).json({
//     status: "success",
//     data: user,
//   });
// });

exports.getNotifies = catchAsync(async (req, res, next) => {
  const id = req.user._id;

  const page = req.query.page * 1 || 1;
  const results = req.query.results * 1 || 10;
  const skip = (page - 1) * results;
  console.log(page, results, skip);

  const findNotifies = await Notify.find({
    account_receive: { $in: [id] },
  })
    .skip(skip)
    .limit(results)
    .sort("-_id")
    .select("-__v")
    .populate({
      path: "account_receive",
      select: "-__v -password",
    })
    .populate({
      path: "account_send",
      select: "-__v -password",
    });
  return res.status(200).json({
    length: findNotifies.length,
    status: "success",
    data: findNotifies,
  });
});
exports.deleteNotifies = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { notifyId } = req.body;
  const findNotifies = await Notify.findOneAndDelete({
    _id: notifyId,
    account_receive: { $in: [id] },
  });
  return res.status(204).end();
});
