// routes/authRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  saveToFavorites,
  removeFavourites,
  isFavourite,
  getAllUsers,
  deleteUser,
  updateUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);
router.post("/saveToFavorites", protect, saveToFavorites);
router.post("/removeFavourites", protect, removeFavourites);
router.get("/isFavourite", protect, isFavourite);
router.get("/users", protect, getAllUsers);
router.delete("/user/:id", protect, deleteUser);
router.put("/user/:id", protect, updateUser);

module.exports = router;
