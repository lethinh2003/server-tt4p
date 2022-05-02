const express = require("express");
const systemController = require("../controllers/system_controller");

const router = express.Router();
router.route("/").get(systemController.getSystem);

module.exports = router;
