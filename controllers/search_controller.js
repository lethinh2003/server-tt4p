const Music = require("../models/music_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");

exports.getAllSearchs = catchAsync(async (req, res, next) => {
  let re = new RegExp("/.*" + "call" + ".*/", "i");

  const query = { name: /.*a.*/i };

  //Execute
  const docs = await Music.find({ name: { $regex: "call" } });

  res.status(200).json({
    status: "success",
    result: docs.length,
    data: {
      data: docs,
    },
  });
});
