const express = require("express");
const heartController = require("../controllers/heartcontroller");
const authController = require("../controllers/authcontroller");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(heartController.getAllHearts)
  .post(authController.protect, heartController.createHeart);

router
  .route("/:id")
  .get(heartController.getHeart)
  .delete(heartController.deleteHeart);
module.exports = router;
