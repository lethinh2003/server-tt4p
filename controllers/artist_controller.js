const Artist = require("../models/artist_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
exports.getAllArtists = factory.getAll(Artist);
exports.getArtist = factory.getOne(Artist);
exports.updateArtist = factory.updateOne(Artist);
exports.deleteArtist = factory.deleteOne(Artist);
exports.createArtist = factory.createOne(Artist);
