const express = require("express");
const { youtubeConverter } = require("../controllers/helperController");
// const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", youtubeConverter);

module.exports = router;
