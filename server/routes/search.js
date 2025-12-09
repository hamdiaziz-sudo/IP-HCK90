const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const SearchController = require("../controllers/searchController");
const upload = require("../helpers/multer");

router.use(authentication);

router.post("/mood", SearchController.recommendByMood);

router.post("/text", SearchController.searchByText);

router.post("/voice", upload.single("audio"), SearchController.searchByVoice);

module.exports = router;
