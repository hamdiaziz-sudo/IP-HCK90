const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const PlaylistController = require("../controllers/playlistController");

router.use(authentication);

// Buat playlist
router.post("/", PlaylistController.create);

// Lihat semua playlist user
router.get("/", PlaylistController.findAll);

// Tambah lagu ke playlist
router.post("/:playlistId/songs/:songId", PlaylistController.addSong);

// Hapus lagu dari playlist
router.delete("/:playlistId/songs/:songId", PlaylistController.removeSong);

module.exports = router;
