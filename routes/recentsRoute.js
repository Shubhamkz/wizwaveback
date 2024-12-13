const express = require("express");
const router = express.Router();
const recentPlaysController = require("../controllers/recentPlaysController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, recentPlaysController.getRecentPlays);
router.post("/", protect, recentPlaysController.addRecentPlay);

module.exports = router;
