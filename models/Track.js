const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    artists: [{ name: String }],
    description: { type: String },
    album: {
      images: [{ url: String }],
    },
    realeaseDate: { type: String },
    genre: { type: String },
    preview_url: { type: String },
    playCount: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  },
  { timestamps: true }
);

module.exports = mongoose.model("Track", TrackSchema);
