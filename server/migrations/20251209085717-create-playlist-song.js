"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PlaylistSongs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      PlaylistId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Playlists",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      SongId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Songs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    // prevent duplicate songs in 1 playlist
    await queryInterface.addConstraint("PlaylistSongs", {
      fields: ["PlaylistId", "SongId"],
      type: "unique",
      name: "unique_playlist_song",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("PlaylistSongs");
  },
};
