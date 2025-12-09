const express = require("express");
const cors = require("cors");
const app = express();
const router = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

app.use(cors());
app.use(express.json());
app.use(router);

app.use(errorHandler);

module.exports = app;
