const Genre = require("../models/genremodel");
const catchAsync = require("../utils/catchasync");
const factory = require("./handlefactory");
exports.getAllGenres = factory.getAll(Genre);
exports.getGenre = factory.getOne(Genre);
exports.updateGenre = factory.updateOne(Genre);
exports.deleteGenre = factory.deleteOne(Genre);
exports.createGenre = factory.createOne(Genre);
