const express = require("express");
const repCommentController = require("../controllers/repComment_controller");
const authController = require("../controllers/auth_controller");
const fileUploader = require("../configs/cloudinary.config");
const router = express.Router();

router.route("/:commentId").post(authController.protect, repCommentController.CreateRepPostComment);
router.route("/edit/:commentId").post(authController.protect, repCommentController.EditPostComment);
router.route("/delete/:commentId").post(authController.protect, repCommentController.DeletePostComment);
router.route("/likes/:repCommentId").post(authController.protect, repCommentController.CreateLikePostRepComment);
router.route("/dislikes/:repCommentId").post(authController.protect, repCommentController.CreateDislikePostRepComment);

module.exports = router;
