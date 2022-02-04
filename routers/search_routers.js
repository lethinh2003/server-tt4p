const express = require("express");
const searchController = require("../controllers/search_controller");
const musicController = require("../controllers/music_controller");
const heartController = require("../controllers/heart_controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/q=:value").get(searchController.getAllSearchs);

module.exports = router;
