const Artist = require("../models/artistmodel");
const catchAsync = require("../utils/catchasync");
const factory = require("./handlefactory");
exports.getAllArtists = factory.getAll(Artist);
exports.getArtist = factory.getOne(Artist);
exports.updateArtist = factory.updateOne(Artist);
exports.deleteArtist = factory.deleteOne(Artist);
exports.createArtist = factory.createOne(Artist);
