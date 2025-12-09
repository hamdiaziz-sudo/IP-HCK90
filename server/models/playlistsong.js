"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PlaylistSong extends Model {
    static associate(models) {
      PlaylistSong.belongsTo(models.Playlist, { foreignKey: "PlaylistId" });
      PlaylistSong.belongsTo(models.Song, { foreignKey: "SongId" });
    }
  }

  PlaylistSong.init(
    {
      PlaylistId: DataTypes.INTEGER,
      SongId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PlaylistSong",
    }
  );

  return PlaylistSong;
};
