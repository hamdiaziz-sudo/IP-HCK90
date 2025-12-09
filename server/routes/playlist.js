const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const PlaylistController = require("../controllers/playlistController");

router.use(authentication);

router.post("/", PlaylistController.create);

router.get("/", PlaylistController.findAll);

router.post("/:playlistId/songs/:songId", PlaylistController.addSong);

router.delete("/:playlistId/songs/:songId", PlaylistController.removeSong);

module.exports = router;
