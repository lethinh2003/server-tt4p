const express = require("express");
const commentController = require("../controllers/comment_controller");
const authController = require("../controllers/auth_controller");
const fileUploader = require("../configs/cloudinary.config");
const router = express.Router();
router.use("/reps", require("./repComment_routers"));
router.route("/:postId").get(authController.protect, commentController.getDetailPostComments);
router.route("/get-all-comments/:userID").get(authController.protect, commentController.getDetailPostCommentsByAccount);
router.route("/:postId").post(authController.protect, commentController.CreatePostComment);
router.route("/edit/:commentId").post(authController.protect, commentController.EditPostComment);
router.route("/delete/:commentId").post(authController.protect, commentController.DeletePostComment);
router.route("/likes/:commentId").post(authController.protect, commentController.CreateLikePostComment);
router.route("/dislikes/:commentId").post(authController.protect, commentController.CreateDislikePostComment);

module.exports = router;
