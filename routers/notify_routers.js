const express = require("express");
const authController = require("../controllers/auth_controller");
const notifyController = require("../controllers/notify_controller");
const router = express.Router();

router.route("/:userID").get(authController.protect, notifyController.getUserNotifies);
router.route("/").post(authController.protect, notifyController.createNotify);
router.route("/delete").post(authController.protect, notifyController.deleteNotify);
router.route("/delete_by_id").post(authController.protect, notifyController.deleteNotifyById);
router.route("/get_numbers/:userID").get(authController.protect, notifyController.getUserNotifiesNumber);

module.exports = router;
