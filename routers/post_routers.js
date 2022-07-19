const express = require("express");
const postController = require("../controllers/post_controller");
const authController = require("../controllers/auth_controller");
const fileUploader = require("../configs/cloudinary.config");
const router = express.Router();
router.use("/comments", require("./comment_routers"));
router.use("/hearts", require("./heart_routers"));
router.route("/upload-file").post(authController.protect, fileUploader.single("file"), postController.uploadFile);
router.route("/").get(authController.protect, postController.getAllPosts);
router.route("/").post(authController.protect, postController.createPost);
router.route("/slug/").post(postController.getDetailPostBySlug);
router.route("/:postID").get(authController.protect, postController.getDetailPost);
router.route("/delete").post(authController.protect, postController.deleteDetailPost);
router.route("/set-status").post(authController.protect, postController.setStatusDetailPost);
// router.route("/hearts/:postID").get(authController.protect, postController.getDetailPostHearts);
router.route("/activities/:userId").get(authController.protect, postController.getDetailPostActivity);
router.route("/activities/:userId").post(authController.protect, postController.deleteDetailPostActivity);

module.exports = router;
