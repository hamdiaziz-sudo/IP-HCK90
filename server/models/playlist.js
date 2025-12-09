"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Playlist extends Model {
    static associate(models) {
      Playlist.belongsTo(models.User, { foreignKey: "UserId" });

      Playlist.belongsToMany(models.Song, {
        through: models.PlaylistSong,
        foreignKey: "PlaylistId",
      });
    }
  }

  Playlist.init(
    {
      name: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Playlist",
    }
  );

  return Playlist;
};
