const express = require("express");
const postController = require("../controllers/post_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();
router.route("/").get(postController.getAllPosts);
router.route("/:postID").get(authController.protect, postController.getDetailPost);
router.route("/activities/:userId").get(authController.protect, postController.getDetailPostActivity);
router.route("/activities/:userId").post(authController.protect, postController.deleteDetailPostActivity);
router.route("/").post(authController.protect, postController.createPost);

module.exports = router;
