// app.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const trackRoutes = require("./routes/trackRoutes");
const playlistRoutes = require("./routes/playlistRoutes");
const helperRoute = require("./routes/helperRoute");
const recentsRoute = require("./routes/recentsRoute");
const cors = require("cors");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.LIVE_DOMAIN, // Frontend URL
    credentials: true, // Allow cookies and credentials
    methods: "GET,HEAD,OPTIONS,POST,PUT,DELETE", // Allowed methods
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization", // Allowed headers
  })
);

// Handle preflight requests (OPTIONS)
app.options("*", cors(), (req, res) => {
  console.log("CORS preflight request handled");
  res.sendStatus(200);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/convert", helperRoute);
app.use("/api/recents", recentsRoute);

// Error handling middleware can be added here for production-level error handling

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
