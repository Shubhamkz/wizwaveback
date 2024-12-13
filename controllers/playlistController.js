const Playlist = require("../models/Playlist");

// Create a new playlist
exports.createPlaylist = async (req, res) => {
  try {
    const createdBy = req.user._id;

    const newPlaylist = new Playlist({
      ...req.body,
      createdBy,
    });
    const savedPlaylist = await newPlaylist.save();
    res.status(201).json(savedPlaylist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all playlists
exports.getPlaylists = async (req, res) => {
  const { trackID } = req.query; // Assuming trackId is passed as a query parameter

  try {
    const playlists = await Playlist.find().populate("tracks");

    // Add a `containsTrack` field to each playlist indicating if the track is included
    const playlistsWithTrackInfo = playlists.map((playlist) => {
      const containsTrack = playlist.tracks.some(
        (track) => track._id.toString() === trackID
      );
      return {
        ...playlist._doc, // Spread to keep the original fields
        containsTrack, // Add the new field
      };
    });

    res.status(200).json(playlistsWithTrackInfo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get User Playlist

exports.getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trackID } = req.query;

    // Find playlists created by the user
    const playlists = await Playlist.find({ createdBy: userId })
      .populate("tracks")
      .populate("createdBy", "username");

    if (playlists.length === 0) {
      return res
        .status(404)
        .json({ message: "No playlists found for this user" });
    }

    const playlistsWithTrackInfo = playlists.map((playlist) => {
      const containsTrack = playlist.tracks.some(
        (track) => track._id.toString() === trackID
      );
      return {
        ...playlist._doc, // Spread to keep the original fields
        containsTrack, // Add the new field
      };
    });

    res.status(200).json(playlistsWithTrackInfo);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a playlist by ID
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate("tracks");

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json(playlist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a playlist (e.g., add/remove tracks)
exports.updatePlaylist = async (req, res) => {
  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("tracks");
    if (!updatedPlaylist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json(updatedPlaylist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(req.params.id);
    if (!deletedPlaylist) {
      return res.status(404).json({ message: "Playlist not found" });
    }
    res.status(200).json({ message: "Playlist deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addTrackToPlaylist = async (req, res) => {
  const { playlistId, trackId } = req.body;

  try {
    // Find the playlist by ID and add the track ID to the tracks array
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if the track is already in the playlist
    if (playlist.tracks.includes(trackId)) {
      return res
        .status(400)
        .json({ message: "Track already exists in the playlist" });
    }

    // Add the track to the playlist
    playlist.tracks.push(trackId);

    // Save the updated playlist
    const updatedPlaylist = await playlist.save();

    res.status(200).json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePrivacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;

    // Ensure the 'isPublic' field is provided in the request body
    if (typeof isPublic === "undefined") {
      return res.status(400).json({ message: "isPublic field is required" });
    }

    // Find the playlist by ID and update its privacy status
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      id,
      { isPublic },
      { new: true }
    );

    if (!updatedPlaylist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json({
      message: `Playlist privacy updated to ${isPublic ? "Public" : "Private"}`,
      playlist: updatedPlaylist,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.allPublicPlaylists = async (req, res) => {
  try {
    // Find all playlists where isPublic is true
    const publicPlaylists = await Playlist.find({ isPublic: true })
      .populate("tracks")
      .populate("createdBy", "name"); // Optionally populate the creator's name

    res.json({
      message: "Public playlists fetched successfully",
      playlists: publicPlaylists,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.checkIsPublic = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the playlist by ID
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Return the isPublic status
    res.json({
      message: `Playlist is ${playlist.isPublic ? "Public" : "Private"}`,
      isPublic: playlist.isPublic,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
