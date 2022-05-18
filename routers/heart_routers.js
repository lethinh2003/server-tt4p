const express = require("express");
const heartController = require("../controllers/heart_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();
router.route("/:userID").get(authController.protect, heartController.getDetailHearts);
router.route("/").post(authController.protect, heartController.createHeart);

module.exports = router;
