const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const catchAsync = require("../utils/catch_async");
const AppError = require("../utils/app_error");

const sendEmail = require("../utils/email");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
const missingValue = (res, message) => {
  return res.status(400).json({
    status: "err",
    message,
  });
};
const invalidValue = (res, message) => {
  return res.status(401).json({
    status: "err",
    message,
  });
};
const notPermission = (res, message) => {
  return res.status(403).json({
    status: "err",
    message,
  });
};
const successValue = (res, message) => {
  return res.status(200).json({
    status: "success",
    message,
  });
};

//FORGOT PASS///
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("fill in email", 400));
  }
  console.log(req.headers.origin);
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError("email invalid", 401));
  }
  const resetToken = await user.createResetPasswordToken(32);
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.get("origin")}/auth/reset-password/${resetToken}`;
  // const resetURL = `${req.get("origin")}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL} \nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    return res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      status: "err",
      message: "There was an error sending the email. Try again later!",
    });
  }
});

///RESET PASS////
exports.checkTokenResetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const checkToken = await crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: checkToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token expired or does not exist !", 400));
  }

  return res.status(200).json({
    status: "success",
    message: "Token valid",
  });
});
///RESET PASS////
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const checkToken = await crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: checkToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token expired or does not exist !", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Reset password sucess, Auto redirect after 3s",
  });
});

///UPDATE PASSWORD///
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });
  const correct = await user.correctPassword(req.body.currentPassword, user.password);
  if (!correct) {
    return next(new AppError("current password invalid", 401));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  const token = signToken(user._id);
  return res.status(200).json({
    status: "success",
    token,
  });
});

////login /////
exports.login = catchAsync(async (req, res, next) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return next(new AppError("fill in account and password", 400));
  }
  const user = await User.findOne({ account: account });
  if (!user) {
    return next(new AppError("account invalid", 401));
  }
  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    return next(new AppError("password invalid", 401));
  }

  const token = signToken(user._id);
  user.password = undefined;
  user.passwordChangedAt = undefined;
  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

//SIGNUP///
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const user = await User.findById(newUser._id).select("-__v -password");
  const token = signToken(newUser._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);

  res.status(201).json({
    status: "success",
    token,
    data: user,
  });
});

//PROTECT//
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return invalidValue(res, "Login to get this api");
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decode);
    const user = await User.findOne({ _id: decode.id });
    if (!user) {
      return invalidValue(res, "Login to get this api");
    }
    // const test = await user.changedPassword(decode.iat);
    // if (test) {
    //   return invalidValue(res, "Login to get this api");
    // }
    req.user = user;
  } catch (err) {
    return invalidValue(res, err);
  }

  next();
};

//PERMISSION//
exports.reStrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not permission", 403));
    }
    next();
  };
};
