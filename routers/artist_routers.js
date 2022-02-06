const express = require("express");
const artistController = require("../controllers/artist_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/").get(artistController.getAllArtists).post(authController.protect, artistController.createArtist);
router
  .route("/:id")
  .get(artistController.getArtist)
  .patch(artistController.updateArtist)
  .delete(artistController.deleteArtist);
module.exports = router;
