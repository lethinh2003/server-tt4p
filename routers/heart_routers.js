const express = require("express");
const heartController = require("../controllers/heart_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router({ mergeParams: true });

router.route("/").get(heartController.getAllHearts).post(authController.protect, heartController.createHeart);

router.route("/delete").post(authController.protect, heartController.deleteHeart);

router.route("/:id").get(heartController.getHeart);

router.route("/user/:userId").get(heartController.getAllHeartsByUserId);
module.exports = router;
