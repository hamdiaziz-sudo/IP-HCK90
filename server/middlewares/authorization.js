const { Song } = require("../models");

async function authorization(req, res, next) {
  try {
    const { role, id: userId } = req.user;
    const { id } = req.params;

    const song = await Song.findByPk(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    if (role !== "admin" && song.UserId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authorization };
