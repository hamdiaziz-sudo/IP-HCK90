"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Song, { foreignKey: "UserId" });
      User.hasMany(models.Playlist, { foreignKey: "UserId" });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true, isEmail: true },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },

      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user",
      },
    },

    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate(user) {
          user.password = hashPassword(user.password);
        },
        beforeUpdate(user) {
          if (user.changed("password")) {
            user.password = hashPassword(user.password);
          }
        },
      },
    }
  );

  return User;
};
