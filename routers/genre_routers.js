const express = require("express");
const genreController = require("../controllers/genre_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/").get(genreController.getAllGenres).post(authController.protect, genreController.createGenre);
router
  .route("/:id")
  .get(genreController.getGenre)
  .patch(genreController.updateGenre)
  .delete(genreController.deleteGenre);
module.exports = router;
