const { Playlist, Song, PlaylistSong } = require("../models");

class PlaylistController {
  // GET /playlists (list playlist user)
  static async findAll(req, res, next) {
    try {
      const playlists = await Playlist.findAll({
        where: { UserId: req.user.id },
        include: [{ model: Song }],
      });

      res.status(200).json(playlists);
    } catch (err) {
      next(err);
    }
  }

  // POST /playlists
  static async create(req, res, next) {
    try {
      const { name } = req.body;
      const playlist = await Playlist.create({
        name,
        UserId: req.user.id,
      });

      res.status(201).json(playlist);
    } catch (err) {
      next(err);
    }
  }

  // POST /playlists/:playlistId/songs/:songId → add song
  static async addSong(req, res, next) {
    try {
      const { playlistId, songId } = req.params;

      const playlist = await Playlist.findOne({
        where: { id: playlistId, UserId: req.user.id },
      });
      if (!playlist)
        return res.status(404).json({ message: "Playlist not found" });

      await PlaylistSong.create({
        PlaylistId: playlistId,
        SongId: songId,
      });

      res.status(201).json({ message: "Song added to playlist" });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /playlists/:playlistId/songs/:songId
  static async removeSong(req, res, next) {
    try {
      const { playlistId, songId } = req.params;

      const playlist = await Playlist.findOne({
        where: { id: playlistId, UserId: req.user.id },
      });
      if (!playlist)
        return res.status(404).json({ message: "Playlist not found" });

      const item = await PlaylistSong.findOne({
        where: { PlaylistId: playlistId, SongId: songId },
      });

      if (!item)
        return res.status(404).json({ message: "Song not found in playlist" });

      await item.destroy();

      res.status(200).json({ message: "Song removed from playlist" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PlaylistController;
