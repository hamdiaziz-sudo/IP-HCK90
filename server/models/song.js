"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Song extends Model {
    static associate(models) {
      Song.belongsTo(models.User, { foreignKey: "UserId" });

      // many-to-many
      Song.belongsToMany(models.Playlist, {
        through: models.PlaylistSong,
        foreignKey: "SongId",
      });
    }
  }

  Song.init(
    {
      title: DataTypes.STRING,
      artist: DataTypes.STRING,
      audioUrl: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Song",
    }
  );

  return Song;
};
