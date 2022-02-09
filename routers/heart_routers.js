const express = require("express");
const heartController = require("../controllers/heart_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router({ mergeParams: true });

router.route("/").get(heartController.getAllHearts).post(authController.protect, heartController.createHeart);
router.route("/:id").get(heartController.getHeart).delete(heartController.deleteHeart);

router.route("/user/:userId").get(authController.protect, heartController.getAllHeartsByUserId);
module.exports = router;
