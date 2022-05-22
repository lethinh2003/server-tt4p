const User = require("../models/User");
const System = require("../models/System");
const ChatRoom = require("../models/ChatRoom");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
const validator = require("validator");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const { json } = require("body-parser");
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("No file uploaded!", 404));
  }
  return res.status(200).json({
    status: "success",
    data: req.file.path,
  });
});
exports.updateUser = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const body = {
    avatar: req.body.avatar,
    name: req.body.name,
  };
  const user = await User.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).select("-password -__v ");

  if (!user) {
    return next(new AppError("No user updated!", 404));
  }
  return res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.checkUser = catchAsync(async (req, res, next) => {
  const { account, email } = req.body;
  if (!account || !email) {
    return next(new AppError("Vui lòng nhập tài khoản hoặc email", 404));
  }
  if (!validator.isEmail(email)) {
    return next(new AppError("Vui lòng nhập email hợp lệ", 404));
  }

  const user = await User.findOne({ $or: [{ account: account }, { email: email }] });

  if (user) {
    return next(new AppError("Tài khoản hoặc email đã có người sử dụng, vui lòng thử lại", 404));
  }
  return res.status(200).json({
    status: "success",
  });
});
exports.checkUserInRoom = catchAsync(async (req, res, next) => {
  const { account } = req.body;
  if (!account) {
    return next(new AppError("Vui lòng nhập thông tin", 404));
  }
  const user = await ChatRoom.findOne({ account: account });
  if (user) {
    return next(
      new AppError("Có vẻ như bạn đang trong phòng khác, vui lòng đóng phòng hiện tại để thực hiện chức năng này", 400)
    );
  }
  return res.status(200).json({
    status: "success",
    message: "OK",
  });
});
exports.getDetailUser = catchAsync(async (req, res, next) => {
  const { account } = req.body;
  if (!account) {
    return next(new AppError("Vui lòng nhập thông tin", 404));
  }
  if (req.user.account !== account) {
    return next(new AppError("Có lỗi xảy ra khi lấy thông tin tài khoản", 404));
  }
  const user = await User.findOne({ account: account }).select("-password -__v");
  return res.status(200).json({
    status: "success",
    data: user,
  });
});
exports.checkActiveEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const checkToken = await crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailActiveToken: checkToken,
    emailActiveTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token expired or does not exist !", 400));
  }
  await User.findOneAndUpdate(
    {
      emailActiveToken: checkToken,
    },
    {
      active_email: true,
      emailActiveToken: undefined,
      emailActiveTokenExpires: undefined,
    }
  );

  return res.status(200).json({
    status: "success",
    message: "Kích hoạt thành công",
  });
});
exports.checkTokenResetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const checkToken = await crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: checkToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token expired or does not exist !", 400));
  }
  // await User.findOneAndUpdate(
  //   {
  //     resetPasswordToken: checkToken,
  //   },
  //   {
  //     resetPasswordToken: undefined,
  //     resetPasswordTokenExpires: undefined,
  //   }
  // );

  return res.status(200).json({
    status: "success",
    data: {
      account: user.account,
      updatedPasswordAt: user.updatedPasswordAt,
    },
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const checkToken = await crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: checkToken,
    resetPasswordTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token expired or does not exist !", 400));
  }
  const newPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    {
      account: user.account,
    },
    {
      password: newPassword,
      updatedPasswordAt: Date.now(),
      resetPasswordToken: undefined,
      resetPasswordTokenExpires: undefined,
    }
  );

  return res.status(200).json({
    status: "success",
    message: "Thay đổi password thành công",
  });
});
exports.updateDetailUser = catchAsync(async (req, res, next) => {
  const { name, findSex, city, hideInfo, bio } = req.body;
  if (name && findSex && city) {
    const sexBelongTo = ["boy", "girl", "lgbt"];

    if (name.length < 2 || !sexBelongTo.includes(findSex)) {
      return next(new AppError("Vui lòng nhập thông tin", 404));
    }

    const user = await User.findOneAndUpdate(
      { account: req.user.account },
      {
        name: name,
        bio: bio,

        findSex: findSex,
        city: city,
      }
    );
    return res.status(200).json({
      status: "success",
      data: "success",
    });
  } else if (hideInfo) {
    const user = await User.findOneAndUpdate(
      { account: req.user.account },
      {
        hideInfo: JSON.parse(hideInfo),
      }
    );
    return res.status(200).json({
      status: "success",
      data: "success",
    });
  }
});
exports.followsUser = catchAsync(async (req, res, next) => {
  const { userId } = req.body;
  const listFollowings = req.user.following;
  const checkIsFollowing = listFollowings.includes(userId);
  if (!userId || userId == req.user._id) {
    return next(new AppError("Vui lòng nhập user id", 404));
  }
  if (checkIsFollowing) {
    await Promise.all([
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $pull: { following: userId },
        }
      ),
      User.findOneAndUpdate(
        { _id: userId },
        {
          $pull: { followers: req.user._id },
        }
      ),
    ]);
    return res.status(200).json({
      status: "success",
      code: 0,
      message: "Unfollow success",
    });
  } else {
    await Promise.all([
      User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: { following: userId },
        }
      ),
      User.findOneAndUpdate(
        { _id: userId },
        {
          $push: { followers: req.user._id },
        }
      ),
    ]);
    return res.status(200).json({
      status: "success",
      code: 1,
      message: "Follow success",
    });
  }
});
exports.suggestionFriends = catchAsync(async (req, res, next) => {
  const limitRandomRecord = req.query.results * 1 || 3;
  console.log(limitRandomRecord);
  User.countDocuments().exec(function (err, count) {
    // Get a random entry
    var random = Math.floor(Math.random() * count);

    // Again query all users but only fetch one offset by our random #
    User.find()
      .skip(random)
      .limit(3)
      .select(
        "-__v -password -resetPasswordToken -resetPasswordTokenExpires -role -updatedPasswordAt -findSex -emailActiveTokenExpires -emailActiveToken -email -city -bio -active_email -date  "
      )
      .exec(function (err, result) {
        res.status(200).json({
          status: "success",

          data: result,
        });
      });
  });
});
exports.activeEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!validator.isEmail(email)) {
    return next(new AppError("Vui lòng nhập email hợp lệ", 404));
  }
  if (req.user.active_email) {
    return next(new AppError("Bạn đã kích hoạt email rồi!", 404));
  }
  const user = await User.findOne({ email: email, account: req.user.account });
  if (!user) {
    return next(new AppError("Vui lòng nhập email hợp lệ", 404));
  }
  const emailActiveToken = await user.createActiveEmailToken(30);
  await user.save({ validateBeforeSave: false });
  const getSystem = await System.findOne({});

  const activeURL = `${req.get("origin")}/active-email/${emailActiveToken}`;

  const message = `
  <b>Kích Hoạt Tài Khoản</b>
  <br>Xin chào ${user.name}, lời đầu tiên chúng tôi xin cảm ơn bạn đã tham gia vào cộng đồng của chúng tôi!
  <br><b>Trò chuyện bốn phương</b> là ứng dụng web mà chúng tôi gây dựng nên để giúp các bạn tìm bạn tâm sự. Cuộc sống này đôi khi quá áp lực, đừng stress, hãy lên <b>Trò chuyện bốn phương</b> để tìm người tâm sự ngay. Chúng tôi cam kết bạn sẽ bớt phần nào stress cuộc sống khi tham gia chat với người lạ!
  <br>Để kích hoạt tài khoản, vui lòng <a href="${activeURL}" target="_blank">click vào đây</a>.
  <br><b>Thông Tin Liên Hệ</b>
  <br>
  Author: ${getSystem.author}
  <br>
  Email: ${getSystem.email ? getSystem.email : "lethinh.developer@gmail.com"}
  
  
  `;

  await sendEmail({
    email: email,
    subject: "Kích hoạt tài khoản trò chuyện 4 phương (valid for 10 min)",
    message: message,
  });
  return res.status(200).json({
    status: "success",
    message: "Thành công. Vui lòng check hộp thư để nhận mail kích hoạt!",
  });
});
exports.missingPassword = catchAsync(async (req, res, next) => {
  const { info_account } = req.body;
  const user = await User.findOne({ $or: [{ email: info_account }, { account: info_account }] });
  if (!user) {
    return next(new AppError("Tài khoản hoặc email không tồn tại", 404));
  }
  const resetPasswordToken = await user.createResetPasswordToken(30);
  await user.save({ validateBeforeSave: false });
  const getSystem = await System.findOne({});

  const activeURL = `${req.get("origin")}/reset-password/${resetPasswordToken}`;

  const message = `
  <b>Khôi Phục Mật Khẩu Tài Khoản</b>
  <br>Xin chào ${user.name}, lời đầu tiên chúng tôi xin cảm ơn bạn đã tham gia vào cộng đồng của chúng tôi!
  <br><b>Trò chuyện bốn phương</b> là ứng dụng web mà chúng tôi gây dựng nên để giúp các bạn tìm bạn tâm sự. Cuộc sống này đôi khi quá áp lực, đừng stress, hãy lên <b>Trò chuyện bốn phương</b> để tìm người tâm sự ngay. Chúng tôi cam kết bạn sẽ bớt phần nào stress cuộc sống khi tham gia chat với người lạ!
  <br>Để khôi phục mật khẩu tài khoản, vui lòng <a href="${activeURL}" target="_blank">click vào đây</a>.
  <br><b>Thông Tin Liên Hệ</b>
  <br>
  Author: ${getSystem.author}
  <br>
  Email: ${getSystem.email ? getSystem.email : "lethinh.developer@gmail.com"}
  
  
  `;

  await sendEmail({
    email: user.email,
    subject: "Khôi phục mật khẩu tài khoản trò chuyện 4 phương (valid for 10 min)",
    message: message,
  });
  return res.status(200).json({
    status: "success",
    message: "Thành công. Vui lòng check hộp thư để nhận mail khôi phục mật khẩu!",
  });
});
exports.updateUserAdmin = catchAsync(async (req, res, next) => {
  const { status, account } = req.body;
  const user = await User.findOneAndUpdate(
    { account: account },
    {
      status: status,
    }
  );
  return res.status(200).json({
    status: "success",
    data: "success",
  });
});
exports.login = async (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(404).json({
      status: "err",
      message: "fill in account and password",
    });
  }
  const user = await User.findOne({ account: account });
  if (!user) {
    return res.status(404).json({
      status: "err",
      message: "account invalid",
    });
  }
  const correct = await user.correctPassword(password, user.password);
  if (!correct) {
    return res.status(404).json({
      status: "err",
      message: "password invalid",
    });
  }
  req.user = user;
  const token = signToken(user._id);
  return res.status(200).json({
    status: "success",
    token,
  });
};
exports.createUser = async (req, res) => {
  try {
    const user = await User.findOne({ account: req.body.account });
    if (user) {
      return res.status(404).json({
        status: "err",
        message: "Tài khoản đã tồn tại, vui lòng thử tài khoản khác",
      });
    }
    const newUser = await User.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Đăng ký thành công, chúc bạn vui vẻ!!",
    });
  } catch (err) {
    res.status(400).json({
      status: "err",
      message: err,
    });
  }
};
exports.getUser = factory.getOne(User);
exports.test = async (req, res) => {
  return res.status(200).json({
    status: "success",
    data: req.user,
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    //filtering
    const excludeFields = ["page", "limit", "sort", "fields"];
    excludeFields.forEach((item) => delete queryObj[item]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryNewObj = JSON.parse(queryStr);
    let query = User.find(queryNewObj);
    //Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("info.createdAt");
    }
    //limit fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v -password");
      // - tien to de k muon hien ra screen
    }
    //pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numUsers = await User.countDocuments();
      console.log(req.query);
      console.log(numUsers, skip);
      if (numUsers < skip) {
        throw new Error("Page doesn't exist");
      }
    }
    //Execute
    const users = await query;
    res.status(200).json({
      status: "success",
      result: users.length,
      page: page,
      limit: limit,
      data: {
        users,
      },
    });
  } catch {
    res.status(404).json({
      status: "err",
      message: "Error",
    });
  }
};
// exports.getMusic = async (req, res) => {
//   try {
//     const music = await Music.findById(req.params.id);
//     res.status(200).json({
//       status: "success",
//       data: {
//         music,
//       },
//     });
//   } catch {
//     res.status(404).json({
//       status: "err",
//       message: "Error",
//     });
//   }
// };
// exports.updateMusic = async (req, res) => {
//   try {
//     const music = await Music.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: "success",
//       data: {
//         music,
//       },
//     });
//   } catch {
//     res.status(404).json({
//       status: "err",
//       message: "Error",
//     });
//   }
// };
// exports.deleteMusic = async (req, res) => {
//   try {
//     await Music.findByIdAndDelete(req.params.id);
//     res.status(204).json({
//       status: "success",
//       message: "Deleted",
//     });
//   } catch {
//     res.status(400).json({
//       status: "err",
//       message: "Error",
//     });
//   }
// };
