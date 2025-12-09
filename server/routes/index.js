const express = require("express");
const router = express.Router();

const userRoutes = require("./users");
const songRoutes = require("./songs");
const playlistRoutes = require("./playlist");
const searchRoutes = require("./search");

router.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

router.use("/users", userRoutes);

router.use("/songs", songRoutes);
router.use("/playlists", playlistRoutes);

router.use("/search", searchRoutes);

module.exports = router;
