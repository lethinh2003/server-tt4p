const express = require("express");
const playlistController = require("../controllers/playlist_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    authController.protect,
    authController.reStrictTo("admin"),
    playlistController.getAllPlaylists
  )
  .post(authController.protect, playlistController.createPlaylist)
  .delete(authController.protect, playlistController.deletePlaylist);

router
  .route("/:userId")
  .get(authController.protect, playlistController.getPlaylist);
router
  .route("/:userId/:musicId")
  .delete(authController.protect, playlistController.deletePlaylist);
module.exports = router;
