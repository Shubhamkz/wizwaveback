const express = require("express");
const router = express.Router();
const trackController = require("../controllers/trackController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, trackController.createTrack);
router.get("/", trackController.getTracks);
router.get("/trendingTracks", protect, trackController.trendingTracks);
router.get("/getTracksByUser", protect, trackController.getTracksByUser);
router.get("/search", protect, trackController.searchTracks);
router.get("/:id", protect, trackController.getTrackById);
router.put("/:id", protect, trackController.updateTrack);
router.delete("/:id", protect, trackController.deleteTrack);
router.put("/updateCount/:id", protect, trackController.updateCount);

module.exports = router;
