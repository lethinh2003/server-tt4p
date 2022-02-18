const Artist = require("../models/artist_model");
const User = require("../models/user_model");
const Music = require("../models/music_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
exports.getAllArtists = factory.getAll(Artist);
exports.getArtist = catchAsync(async (req, res, next) => {
  const getArtistById = Artist.findById(req.params.id);
  const getMusicsByArtist = Music.find({
    artist: { $in: [req.params.id] },
  }).select("-artist -genres");
  await Promise.all([getArtistById, getMusicsByArtist]).then(async (data) => {
    res.status(200).json({
      status: "success",
      data: {
        data: [
          {
            artist: data[0],
          },
          {
            musics: data[1],
          },
        ],
      },
    });
  });
});
exports.updateArtist = factory.updateOne(Artist);
exports.deleteArtist = factory.deleteOne(Artist);
exports.createArtist = factory.createOne(Artist);
