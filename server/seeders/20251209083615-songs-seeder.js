"use strict";

const fs = require("fs");
const path = require("path");

module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "..", "data", "songs.json");
    const songs = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    await queryInterface.bulkInsert("Songs", songs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Songs", null, {});
  },
};
