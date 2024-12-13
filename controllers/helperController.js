const ytdl = require("yt-dlp-exec");
const fs = require("fs");
const path = require("path");

exports.youtubeConverter = async (req, res) => {
  const youtubeUrl = req.query.url;

  if (!youtubeUrl) {
    return res.status(400).send("YouTube URL is required.");
  }

  try {
    // Download the audio stream in webm format
    const outputFile = path.resolve(__dirname, "output.webm");
    const download = ytdl(youtubeUrl, {
      format: "bestaudio", // Choose the best audio format YouTube provides
      output: outputFile,
    });

    // Wait for the download to finish
    download
      .then(() => {
        res.download(outputFile, "audio.webm", () => {
          // Remove the file after download
          fs.unlinkSync(outputFile);
        });
      })
      .catch((error) => {
        console.error("Error downloading YouTube audio:", error);
        res.status(500).send("Failed to download audio.");
      });
  } catch (error) {
    console.error("Error converting YouTube video:", error);
    res.status(500).send("Failed to convert video.");
  }
};
