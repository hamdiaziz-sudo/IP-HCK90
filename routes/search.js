const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const SearchController = require("../controllers/SearchController");
const upload = require("../helpers/multer");

router.use(authentication);

router.post("/voice", upload.single("audio"), SearchController.searchByVoice);

module.exports = router;
