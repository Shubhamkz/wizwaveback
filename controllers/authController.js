// controllers/authController.js

const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Track = require("../models/Track");
const bcrypt = require("bcrypt");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password,
      role: "user",
    });
    await newUser.save();

    const tokenPayload = {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.username,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie(String(newUser._id), token, {
      path: "/",
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,
      sameSite: "lax",
    });

    const { password: registeredPass, ...userWithoutPassword } =
      newUser.toObject();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error", err });
  }
};

exports.loginUser = async (req, res, next) => {
  const { password } = req.body;
  console.log(typeof password);
  let email = req.body.email;
  const lowercaseEmail = email.toLowerCase();
  email = lowercaseEmail;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    return new Error(error);
  }

  if (!existingUser) {
    return res.status(400).json({
      error: true,
      message: "User not found",
    });
  }

  if (!existingUser.password) {
    return res.status(403).json({
      message:
        "User password not found , login wiht Google and set your password first",
    });
  }
  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordCorrect) {
    return res.status(400).json({
      error: true,
      message: "Invalid  password.",
    });
  }

  const tokenPayload = {
    id: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
    name: existingUser.name,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  // console.log("Generated token\n", token);

  if (req.cookies[`${existingUser._id}`]) {
    req.cookies[`${existingUser._id}`] = "";
  }

  res.cookie(String(existingUser._id), token, {
    path: "/",
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax",
  });
  const { password: loggedInPass, ...userWithoutPassword } =
    existingUser.toObject();

  return res.status(200).json({
    success: true,
    message: "Successfully Logged In",
    user: userWithoutPassword,
    token,
  });
};

// Logout User
exports.logoutUser = (req, res) => {
  const domain =
    process.env.NODE_ENV === "production"
      ? process.env.LIVE_DOMAIN
      : "localhost";

  res
    .clearCookie("token", {
      path: "/",
      domain: domain,
      secure: true,
      httpOnly: true,
      sameSite: "Strict",
    })
    .status(200)
    .json({ message: "User logged out" });
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.saveToFavorites = async (req, res) => {
  try {
    const { trackId } = req.body;
    const user = await User.findById(req.user.id);

    // Check if the track is already in the favorites
    if (user.favorites.includes(trackId)) {
      return res.status(400).json({ message: "Track is already in favorites" });
    }

    user.favorites.push(trackId);
    await user.save();

    res.status(200).json({ message: "Track added to favorites", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.removeFavourites = async (req, res) => {
  try {
    const { userId, trackId } = req.body;
    const user = await User.findById(userId);

    // Check if the track is in the favorites
    if (!user.favorites.includes(trackId)) {
      return res.status(400).json({ message: "Track is not in favorites" });
    }

    user.favorites = user.favorites.filter(
      (favoriteTrackId) => favoriteTrackId.toString() !== trackId
    );
    await user.save();

    res.status(200).json({ message: "Track removed from favorites", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.isFavourite = async (req, res) => {
  try {
    const { trackId } = req.query;
    const user = await User.findById(req.user.id);

    console.log(trackId);

    // Check if the track is in the user's favorites
    const isFavorite = user.favorites.includes(trackId);

    res.status(200).json({
      trackId,
      isFavorite,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    // Check if user existed
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = req.body.role || user.role;
    await user.save();

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
