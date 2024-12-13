const Playlist = require("../models/Playlist");
const RecentPlays = require("../models/RecentPlays");

exports.addRecentPlay = async (req, res) => {
  const { trackId } = req.body;

  const userID = req.user.id;

  try {
    const recentPlay = new RecentPlays({ user: userID, track: trackId });
    await recentPlay.save();

    res.status(201).json({ message: "Track added to recent plays." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getRecentPlays = async (req, res) => {
  const userID = req.user.id; // Assuming user ID is available from auth

  try {
    // Get recently played tracks by the user
    const recentPlays = await RecentPlays.find({ user: userID })
      .sort({ playedAt: -1 }) // Most recent first
      .populate("track")
      .limit(50); // Fetch more to ensure uniqueness (you can adjust this)

    // Use a Map to store unique tracks by their ID
    const uniqueTracksMap = new Map();

    recentPlays.forEach((recentPlay) => {
      if (recentPlay.track) {
        // Check if track exists
        const trackID = recentPlay.track._id.toString();
        if (!uniqueTracksMap.has(trackID)) {
          uniqueTracksMap.set(trackID, {
            track: recentPlay.track,
            playedAt: recentPlay.playedAt, // Optionally include the timestamp
          });
        }
      }
    });

    // Convert the Map values to an array and limit the response to 10 unique tracks
    const uniqueTracks = Array.from(uniqueTracksMap.values()).slice(0, 10);

    res.status(200).json(uniqueTracks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
