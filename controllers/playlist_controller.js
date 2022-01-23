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
exports.deletePlaylist = factory.deleteOne(Playlist);

exports.createPlaylist = catchAsync(async (req, res, next) => {
  if (!req.body.music) {
    req.body.music = req.params.idMusic;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  const checkUser = await User.findById(req.body.user);
  const checkMusic = await Music.findById(req.body.music);
  const checkUserPlaylistMusic = await Playlist.find({
    user: { $in: [req.body.user] },
    music: { $in: [req.body.music] },
  });
  if (checkUser && checkMusic) {
    if (checkUserPlaylistMusic && checkUserPlaylistMusic.length > 0) {
      return next(
        new AppError("You have added this music in your playlist!", 401)
      );
    }
    const newPlaylist = await Playlist.create(req.body);
    res.status(201).json({
      status: "success",
      data: newPlaylist,
    });
  }
});
