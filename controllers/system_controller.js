const System = require("../models/System");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const { json } = require("body-parser");

exports.getSystem = async (req, res) => {
  const systemData = await System.findOne({});
  return res.status(200).json({
    status: "success",
    data: systemData,
  });
};
