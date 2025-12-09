const express = require("express");
const router = express.Router();

const userRoutes = require("./users");
const songRoutes = require("./songs");
const playlistRoutes = require("./playlist");
const searchRoutes = require("./search"); // <-- JANGAN LUPA IMPORT INI

router.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// public
router.use("/users", userRoutes);

// protected
router.use("/songs", songRoutes);
router.use("/playlists", playlistRoutes);

// AI Search (protected)
router.use("/search", searchRoutes); // <-- MASUKKAN INI

module.exports = router;
