const { Song } = require("../models");

async function authorization(req, res, next) {
  try {
    const { role } = req.user;
    const { id } = req.params;

    // hanya admin yang boleh
    if (role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // cek apakah song ada
    const song = await Song.findByPk(id);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { authorization };
