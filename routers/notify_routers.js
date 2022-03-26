const express = require("express");
const notifyController = require("../controllers/notify_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();
// router.route("/upload-avatar").post(authController.protect, fileUploader.single("file"), userController.uploadAvatar);
// router.route("/update").post(authController.protect, userController.updateUser);
router.route("/").get(authController.protect, notifyController.getNotifies);
router.route("/").post(authController.protect, notifyController.deleteNotifies);
// router
//   .route("/:id")
//   .get(musicController.getMusic)
//   .patch(musicController.updateMusic)
//   .delete(musicController.deleteMusic);
module.exports = router;
