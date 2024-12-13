const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assuming you have User model
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", PlaylistSchema);
