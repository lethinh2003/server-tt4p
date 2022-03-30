const express = require("express");
const commentController = require("../controllers/comment_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/").get(authController.protect, commentController.getComments);
router.route("/").post(authController.protect, commentController.deleteComments);
router.route("/delete").post(authController.protect, commentController.deleteComments);
router.route("/like").post(authController.protect, commentController.likeComments);
router.route("/reply").post(authController.protect, commentController.replyComments);
router.route("/history-like").get(authController.protect, commentController.historyLikeComments);
router.route("/detail/:sourceId").post(authController.protect, commentController.postComments);
router.route("/detail/:sourceId").get(commentController.getDetailComments);

module.exports = router;
