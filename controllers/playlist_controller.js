const Playlist = require("../models/playlist_model");
const User = require("../models/user_model");
const Music = require("../models/music_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
const AppError = require("../utils/app_error");
exports.getAllPlaylists = catchAsync(async (req, res, next) => {
  const playlists = await Playlist.find();
  res.status(200).json({
    status: "success",
    data: {
      playlists,
    },
  });
});
// exports.getPlaylist = factory.getOne(Playlist);
exports.getPlaylist = catchAsync(async (req, res, next) => {
  const doc = await Playlist.find({
    user: { $in: [req.params.userId] },
  })

    .populate({
      path: "music",
      select: "-__v",
    })
    .select("-__v -user");
  if (!doc) {
    return next(new AppError("No document find with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});
exports.deletePlaylist = catchAsync(async (req, res, next) => {
  const doc = await Playlist.findOneAndDelete({
    user: { $in: [req.params.userId] },
    music: { $in: [req.params.musicId] },
  });
  if (!doc) {
    return next(new AppError("No document find with that id", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Music deleted",
  });
});

exports.createPlaylist = catchAsync(async (req, res, next) => {
  if (!req.body.music) {
    req.body.music = req.params.idMusic;
  }
  const checkUser = User.findById(req.user._id);
  const checkMusic = Music.findById(req.body.music);
  const checkUserPlaylistMusic = Playlist.find({
    user: { $in: [req.user._id] },
    music: { $in: [req.body.music] },
  });
  await Promise.all([checkUser, checkMusic, checkUserPlaylistMusic]).then(async (data) => {
    if (data[2].length > 0) {
      return next(new AppError("You have added this music in your playlist!", 401));
    }
    const newPlaylist = await Playlist.create({
      user: [req.user._id],
      music: [req.body.music],
    });
    res.status(201).json({
      status: "success",
      data: newPlaylist,
    });
  });
  // if (checkUser && checkMusic) {
  //   if (checkUserPlaylistMusic && checkUserPlaylistMusic.length > 0) {
  //     return next(new AppError("You have added this music in your playlist!", 401));
  //   }
  //   const newPlaylist = await Playlist.create(req.body);
  //   res.status(201).json({
  //     status: "success",
  //     data: newPlaylist,
  //   });
  // }
});
