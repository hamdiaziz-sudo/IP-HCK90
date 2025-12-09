const { Song, User } = require("../models");

class SongsController {
  static async create(req, res, next) {
    try {
      const { title, artist, audioUrl } = req.body;
      const UserId = req.user.id; // from authentication middleware

      if (!title || !artist || !audioUrl) {
        return res
          .status(400)
          .json({ message: "title, artist, and audioUrl are required" });
      }

      const song = await Song.create({ title, artist, audioUrl, UserId });
      res.status(201).json(song);
    } catch (err) {
      next(err);
    }
  }

  static async findAll(req, res, next) {
    try {
      const songs = await Song.findAll({
        include: [{ model: User, attributes: ["id", "username", "email"] }],
      });
      res.status(200).json(songs);
    } catch (err) {
      next(err);
    }
  }

  static async findOne(req, res, next) {
    try {
      const { id } = req.params;
      const song = await Song.findByPk(id, {
        include: [{ model: User, attributes: ["id", "username", "email"] }],
      });

      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      res.status(200).json(song);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, artist, audioUrl } = req.body;

      const song = await Song.findByPk(id);
      if (!song) return res.status(404).json({ message: "Song not found" });

      // authorization middleware already checked ownership/admin
      song.title = title ?? song.title;
      song.artist = artist ?? song.artist;
      song.audioUrl = audioUrl ?? song.audioUrl;

      await song.save();
      res.status(200).json(song);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const song = await Song.findByPk(id);
      if (!song) return res.status(404).json({ message: "Song not found" });

      await song.destroy();
      res.status(200).json({ message: "Song deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SongsController;
