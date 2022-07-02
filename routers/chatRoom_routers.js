const express = require("express");
const chatRoomController = require("../controllers/chatRoom_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/check-user-in-room").post(authController.protect, chatRoomController.checkUserInRoom);

module.exports = router;
