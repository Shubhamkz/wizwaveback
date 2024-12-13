const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistController");
const { protect } = require("../middleware/authMiddleware");

router.get("/getUserPlaylists", protect, playlistController.getUserPlaylists);
router.post("/", protect, playlistController.createPlaylist);
router.get("/", protect, playlistController.getPlaylists);
router.get("/allPublicPlaylists", playlistController.allPublicPlaylists);
router.get("/checkIsPublic", protect, playlistController.checkIsPublic);
router.get("/:id", playlistController.getPlaylistById);
router.put("/:id", playlistController.updatePlaylist);
router.put("/changePrivacy/:id", protect, playlistController.changePrivacy);
router.delete("/:id", protect, playlistController.deletePlaylist);
router.post(
  "/addTrackToPlaylist",
  protect,
  playlistController.addTrackToPlaylist
);

module.exports = router;
