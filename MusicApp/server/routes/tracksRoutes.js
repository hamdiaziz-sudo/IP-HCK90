const express = require("express");
const authenticateToken = require("../middlewares/authentication");
const musicController = require("../controllers/musicController");

const router = express.Router();

// Search music by keyword
router.get("/search", authenticateToken, musicController.searchMusic);

// Search music by genre (for home page recommendations)
router.get("/genre/:genre", authenticateToken, musicController.searchByGenre);

// Search music by mood
router.post("/mood", authenticateToken, musicController.searchByMood);

// Get search history (must be before /:id to avoid route conflict)
router.get(
  "/history/user",
  authenticateToken,
  musicController.getSearchHistory,
);

// Get song details
router.get("/:id", authenticateToken, musicController.getSongDetails);

// Get lyrics
router.get("/:id/lyrics", authenticateToken, musicController.getSongLyrics);

// Generate AI lyrics for a track
router.post(
  "/:id/generate-lyrics",
  authenticateToken,
  musicController.generateSongLyrics,
);

module.exports = router;
