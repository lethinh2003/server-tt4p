const express = require("express");
const chatRoomController = require("../controllers/chatRoom_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/check-user-in-room").post(authController.protect, chatRoomController.checkUserInRoom);
router.route("/check-room").post(authController.protect, chatRoomController.checkRoom);
router.route("/get-messages").post(authController.protect, chatRoomController.getMessages);
router.route("/update-status").post(authController.protect, chatRoomController.updateStatus);

module.exports = router;
