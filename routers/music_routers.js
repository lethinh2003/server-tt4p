const express = require("express");
const musicController = require("../controllers/music_controller");
const heartController = require("../controllers/heart_controller");
const authController = require("../controllers/auth_controller");
const heartRouters = require("./heart_routers");
const playlistRouters = require("./playlist_routers");

const router = express.Router();
const fileUploader = require("../configs/cloudinary.config");
router.use("/:idMusic/hearts", heartRouters);
router.use("/:idMusic/playlists", playlistRouters);
router.route("/top-views-day").get(musicController.getTopViewsDayMusics, musicController.getAllMusics);
router.route("/new-musics").get(musicController.getNewMusics, musicController.getAllMusics);
router
  .route("/upload-thumbnail")
  .post(authController.protect, fileUploader.single("file"), musicController.uploadThumbnail);
router.route("/upload-link").post(authController.protect, fileUploader.single("file"), musicController.uploadLink);

router.route("/").get(musicController.getAllMusics).post(musicController.createMusic);
router.route("/:id/update-views").post(musicController.updateViews);
router
  .route("/:id")
  .get(musicController.getMusic)
  .patch(musicController.updateMusic)
  .delete(musicController.deleteMusic);
module.exports = router;
