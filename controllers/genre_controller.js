const Genre = require("../models/genre_model");
const catchAsync = require("../utils/catch_async");
const factory = require("./handle_factory");
exports.getAllGenres = factory.getAll(Genre);
exports.getGenre = factory.getOne(Genre);
exports.updateGenre = factory.updateOne(Genre);
exports.deleteGenre = factory.deleteOne(Genre);
exports.createGenre = factory.createOne(Genre);
