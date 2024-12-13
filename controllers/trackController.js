const Track = require("../models/Track");

// Create a new track
exports.createTrack = async (req, res) => {
  try {
    const userId = req.user.id;

    const newTrack = new Track({
      ...req.body,
      user: userId,
    });
    const savedTrack = await newTrack.save();
    res.status(201).json(savedTrack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTracksByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Infinite scrolling: Get 'skip' and 'limit' from query parameters or set default values
    const skip = parseInt(req.query.skip) || 0; // Default to 0 (start from the first track)
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per request

    let query = {};

    // If the user is not an admin, fetch only their tracks
    if (role !== "admin") {
      query = { user: userId };
    }

    // Fetch tracks with skip and limit
    const tracks = await Track.find(query)
      .populate("user", "name")
      .skip(skip) // Skip the already loaded tracks
      .limit(limit); // Load the next set of tracks

    // Get the total count of tracks (useful for frontend to stop loading when all are loaded)
    const totalTracks = await Track.countDocuments(query);

    res.status(200).json({
      tracks,
      totalTracks, // This is used by the frontend to calculate when to stop loading
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tracks

exports.getTracks = async (req, res) => {
  try {
    const { page = 1, limit = 10, year, genre } = req.query;

    // Initialize filters object
    const filters = {};

    // Filter by release year if the `year` param is provided
    if (year) {
      filters.realeaseDate = { $regex: new RegExp(year, "i") };
    }

    // Filter by genre (case-insensitive) if the `genre` param is provided
    if (genre) {
      filters.genre = { $regex: new RegExp(genre, "i") };
    }

    // Pagination options
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }, // Sort by creation date in descending order
    };

    // Fetch tracks with filters and pagination
    const tracks = await Track.find(filters)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    // Count total documents for pagination metadata
    const totalTracks = await Track.countDocuments(filters);

    res.status(200).json({
      tracks,
      currentPage: options.page,
      totalPages: Math.ceil(totalTracks / options.limit),
      totalTracks,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single track by ID
exports.getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }
    res.status(200).json(track);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a track
exports.updateTrack = async (req, res) => {
  try {
    const updatedTrack = await Track.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTrack) {
      return res.status(404).json({ message: "Track not found" });
    }
    res.status(200).json(updatedTrack);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a track
exports.deleteTrack = async (req, res) => {
  try {
    const deletedTrack = await Track.findByIdAndDelete(req.params.id);
    if (!deletedTrack) {
      return res.status(404).json({ message: "Track not found" });
    }
    res.status(200).json({ message: "Track deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Search a track

exports.searchTracks = async (req, res) => {
  try {
    const { keywords } = req.query; // Get the search keywords from the query params (e.g., ?keywords=rock,metal)

    if (!keywords) {
      return res.status(400).json({ message: "Search keywords are required" });
    }

    // Split the keywords string into an array of individual words/phrases
    const keywordArray = keywords.split(",").map((keyword) => keyword.trim());

    // Build the search query dynamically
    const searchConditions = keywordArray.map((keyword) => ({
      $or: [
        { name: { $regex: keyword, $options: "i" } }, // Search in track name
        { "artists.name": { $regex: keyword, $options: "i" } }, // Search in artists' names
      ],
    }));

    // Find the tracks that match any of the conditions
    const tracks = await Track.find({
      $and: searchConditions,
    }).limit(20); // Limit the number of results to 20 for performance reasons

    if (tracks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tracks found matching your search" });
    }

    res.status(200).json(tracks); // Return the found tracks
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.updateCount = async (req, res) => {
  const trackId = req.params.id;

  try {
    const track = await Track.findByIdAndUpdate(
      trackId,
      { $inc: { playCount: 1 } }, // Increment playCount by 1
      { new: true }
    );

    if (!track) {
      return res.status(404).json({ message: "Track not found" });
    }

    res.status(200).json(track);
  } catch (error) {
    console.error("Error updating play count:", error);
    res.status(500).json({ error: "Failed to update play count" });
  }
};

exports.trendingTracks = async (req, res) => {
  try {
    // Fetch the top 10 trending tracks sorted by playCount and most recent
    const trendingTracks = await Track.find()
      .sort({ playCount: -1, createdAt: -1 }) // Sort by highest play count and latest creation date
      .limit(10); // Limit to the top 10

    // Return the trending tracks as a response
    res.status(200).json(trendingTracks);
  } catch (error) {
    console.error("Error fetching trending tracks:", error);
    res.status(500).json({ error: "Failed to fetch trending tracks" });
  }
};
