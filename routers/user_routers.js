const express = require("express");
const userController = require("../controllers/user_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();
const fileUploader = require("../configs/cloudinary.config");
// router.route("/signup").post(authController.signUp);
// router.route("/login").post(authController.login);
// router.route("/forgotPassword").post(authController.forgotPassword);
// router.route("/resetPassword/:token").get(authController.checkTokenResetPassword).post(authController.resetPassword);
// router.route("/updatePassword").post(authController.protect, authController.updatePassword);
// router.route("/").get(authController.protect, authController.reStrictTo("admin", "user"), userController.getAllUsers);
// router.route("/:id").get(authController.protect, userController.getUser);
// router.route("/upload-avatar").post(authController.protect, fileUploader.single("file"), userController.uploadAvatar);
// router.route("/update").post(authController.protect, userController.updateUser);
router.route("/check-user").post(userController.checkUser);
router.route("/check-in-room").post(userController.checkUserInRoom);
router.route("/sign-up").post(userController.createUser);
// router
//   .route("/:id")
//   .get(musicController.getMusic)
//   .patch(musicController.updateMusic)
//   .delete(musicController.deleteMusic);
module.exports = router;
