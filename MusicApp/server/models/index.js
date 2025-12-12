require("dotenv").config();
const { Sequelize } = require("sequelize");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../config/config.json"))[env];

let sequelize;

if (config.use_env_variable) {
  // Production pakai DATABASE_URL
  const connectionUri = process.env[config.use_env_variable];

  if (!connectionUri) {
    console.error(
      `Missing environment variable: ${config.use_env_variable}. Set DATABASE_URL to your Postgres connection string.`
    );
    throw new Error(
      `${config.use_env_variable} is not set. Cannot initialize database connection.`
    );
  }

  sequelize = new Sequelize(connectionUri, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
  });
} else {
  // Development pakai config json
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port || 5432,
    dialect: config.dialect,
    logging: false,
  });
}

const db = {
  sequelize,
  Sequelize,
};

// Import models
db.User = require("./User")(sequelize, Sequelize);
db.Playlist = require("./Playlist")(sequelize, Sequelize);
db.Song = require("./Song")(sequelize, Sequelize);
db.PlaylistSong = require("./PlaylistSong")(sequelize, Sequelize);
db.Favorite = require("./Favorite")(sequelize, Sequelize);
db.SearchHistory = require("./SearchHistory")(sequelize, Sequelize);

// Define associations
db.User.hasMany(db.Playlist, { foreignKey: "userId", onDelete: "CASCADE" });
db.Playlist.belongsTo(db.User, { foreignKey: "userId" });

db.Playlist.belongsToMany(db.Song, {
  through: db.PlaylistSong,
  foreignKey: "playlistId",
});
db.Song.belongsToMany(db.Playlist, {
  through: db.PlaylistSong,
  foreignKey: "songId",
});

db.User.hasMany(db.Favorite, { foreignKey: "userId", onDelete: "CASCADE" });
db.Favorite.belongsTo(db.User, { foreignKey: "userId" });

db.Favorite.belongsTo(db.Song, { foreignKey: "songId" });
db.Song.hasMany(db.Favorite, { foreignKey: "songId" });

db.User.hasMany(db.SearchHistory, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});
db.SearchHistory.belongsTo(db.User, { foreignKey: "userId" });

module.exports = db;
