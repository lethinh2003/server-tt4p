const Comment = require("../models/Comment");
const HistoryLike = require("../models/HistoryLike");
const RepComment = require("../models/RepComment");
const Notify = require("../models/Notify");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");

exports.getComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const page = req.query.page * 1 || 1;
  const results = req.query.results * 1 || 10;
  const skip = (page - 1) * results;

  const findComments = await Comment.find({
    user: { $in: [id] },
  })
    .skip(skip)
    .limit(results)
    .populate({
      path: "user",
      select: "-__v -password",
    })
    .populate({
      path: "reply",
      select: "-__v -password",
    })
    .populate({
      path: "code",
      select: "-__v -link",
    })

    .sort("-_id")
    .select("-__v");
  return res.status(200).json({
    time: req.timeNow,
    length: findComments.length,
    status: "success",
    data: findComments,
  });
});
exports.deleteComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { commentId } = req.body;
  const deleteCmt = Comment.findOneAndDelete({
    _id: commentId,
    user: { $in: [id] },
  });
  const deleteLike = HistoryLike.deleteMany({
    comment: { $in: [commentId] },
  });
  const deleteReply = RepComment.deleteMany({
    comment: { $in: [commentId] },
  });
  await Promise.all([deleteCmt, deleteLike, deleteReply]);
  return res.status(204).end();
});
exports.likeComments = catchAsync(async (req, res, next) => {
  console.log("like comment");
  const id = req.user._id;
  const { commentId, accountId, linkNotify } = req.body;
  const findComment = await Comment.find({
    _id: commentId,
  })
    .populate({
      path: "user",
      select: "-__v -password",
    })
    .populate({
      path: "reply",
      select: "-__v -password",
    });
  const checkUserLikedComment = await Comment.find({
    _id: commentId,
    likes: { $in: [accountId] },
  });

  //unlike
  if (checkUserLikedComment.length > 0) {
    await Comment.findByIdAndUpdate(commentId, {
      $pull: {
        likes: accountId,
      },
    });
    await HistoryLike.deleteOne({
      user: { $in: [id] },
      comment: { $in: [commentId] },
    });
    return res.status(200).json({
      status: "success",
      message: "unlike",
    });
  } else {
    if (id.toString() !== findComment[0].user[0]._id.toString()) {
      await Comment.findByIdAndUpdate(commentId, {
        $push: {
          likes: accountId,
        },
      });
      await HistoryLike.create({
        user: [id],
        comment: [commentId],
      });
      await Notify.create({
        link: linkNotify,
        account_send: [id],
        account_receive: [findComment[0].user[0]._id],
        content: `{name} vừa like comment: "${findComment[0].content}" của bạn.`,
      });
    } else {
      await Comment.findByIdAndUpdate(commentId, {
        $push: {
          likes: accountId,
        },
      });
      await HistoryLike.create({
        user: [id],
        comment: [commentId],
      });
    }
    return res.status(200).json({
      status: "success",
      message: "like",
    });
  }
});
exports.replyComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { commentId, content, linkNotify } = req.body;
  const findComment = await Comment.find({
    _id: commentId,
  })
    .populate({
      path: "user",
      select: "-__v -password",
    })
    .populate({
      path: "reply",
      select: "-__v -password",
    });
  if (id.toString() === findComment[0].user[0]._id.toString()) {
    const createReplyComment = await RepComment.create({
      user: [id],
      comment: [findComment[0]._id],
      content: content,
    });
    const updateComment = await Comment.findByIdAndUpdate(commentId, {
      $push: {
        reply: createReplyComment._id,
      },
    });
    return res.status(200).json({
      status: "success",
      message: "Thanh cong",
    });
  } else {
    const createReplyComment = await RepComment.create({
      user: [id],
      comment: [findComment[0]._id],
      content: content,
    });
    const updateComment = Comment.findByIdAndUpdate(commentId, {
      $push: {
        reply: createReplyComment._id,
      },
    });
    const sendNotify = Notify.create({
      link: linkNotify,
      account_send: [id],
      account_receive: [findComment[0].user[0]._id],
      content: `{name} vừa reply: "${content}" tại comment: "${findComment[0].content}" của bạn.`,
    });
    await Promise.all([updateComment, sendNotify]);
    let listSendNotifies = [];
    let listArrayCheck = [];

    const loopSendNotifies = findComment[0].reply.map((item) => {
      if (!checkValid(listArrayCheck, item.user[0].account)) {
        const newNotify = Notify.create({
          link: linkNotify,
          account_send: [id],
          account_receive: [item.user[0]._id],
          content: `{name} vừa reply: "${content}" tại comment: "${findComment[0].content}" của ${findComment[0].user[0].name}.`,
        });

        listSendNotifies.push(newNotify);
        listArrayCheck.push({
          account: item.user[0].account,
        });
      }
    });

    await Promise.all(listSendNotifies);
    return res.status(200).json({
      status: "success",
      message: "Thanh cong",
    });
  }
});
exports.postComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { sourceId } = req.params;
  const { content, type } = req.body;
  if (type === "code") {
    await Comment.create({
      user: [id],
      code: [sourceId],
      content: content,
    });
  } else if (type === "blog") {
    await Comment.create({
      user: [id],
      blog: [sourceId],
      content: content,
    });
  }
  return res.status(200).json({
    status: "success",
    message: "Comment thành công 2",
  });
});
exports.getDetailComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const { sourceId } = req.params;

  const results = await Comment.find({
    $or: [
      {
        code: { $in: [sourceId] },
      },
      {
        blog: { $in: [sourceId] },
      },
    ],
  })
    .populate({
      path: "user",
      select: "-__v -password",
    })
    .populate({
      path: "reply",
      select: "-__v -password",
    })
    .populate({
      path: "code",
      select: "-__v -link",
    })

    .sort("-_id")
    .select("-__v");
  return res.status(200).json({
    status: "success",
    data: results,
  });
});
exports.historyLikeComments = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  console.log("hitory");
  const { sourceId } = req.params;
  const results = await HistoryLike.find({
    user: { $in: [id] },
  }).select(" -__v");

  return res.status(200).json({
    status: "success",
    data: results,
  });
});
