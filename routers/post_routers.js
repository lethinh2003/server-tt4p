const express = require("express");
const postController = require("../controllers/post_controller");
const authController = require("../controllers/auth_controller");
const fileUploader = require("../configs/cloudinary.config");
const router = express.Router();
router.route("/upload-file").post(authController.protect, fileUploader.single("file"), postController.uploadFile);
router.route("/").get(authController.protect, postController.getAllPosts);
router.route("/slug/").post(postController.getDetailPostBySlug);
router.route("/:postID").get(authController.protect, postController.getDetailPost);
router.route("/activities/:userId").get(authController.protect, postController.getDetailPostActivity);
router.route("/activities/:userId").post(authController.protect, postController.deleteDetailPostActivity);
router.route("/comments/:postId").get(authController.protect, postController.getDetailPostComments);
router.route("/comments/:postId").post(authController.protect, postController.CreatePostComment);
router.route("/comments/likes/:commentId").post(authController.protect, postController.CreateLikePostComment);
router.route("/comments/dislikes/:commentId").post(authController.protect, postController.CreateDislikePostComment);
router.route("/").post(authController.protect, postController.createPost);

module.exports = router;
