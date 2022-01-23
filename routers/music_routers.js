const express = require("express");
const musicController = require("../controllers/music_controller");
const heartController = require("../controllers/heart_controller");
const authController = require("../controllers/auth_controller");
const heartRouters = require("./heart_routers");

const router = express.Router();
router.use("/:idMusic/hearts", heartRouters);
router
  .route("/top-views-day")
  .get(musicController.getTopViewsDayMusics, musicController.getAllMusics);

router
  .route("/")
  .get(musicController.getAllMusics)
  .post(musicController.createMusic);

router
  .route("/:id")
  .get(musicController.getMusic)
  .patch(musicController.updateMusic)
  .delete(musicController.deleteMusic);
module.exports = router;
