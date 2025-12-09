"use strict";

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const filePath = path.join(__dirname, "..", "data", "users.json");
    let users = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    users = users.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }));

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
