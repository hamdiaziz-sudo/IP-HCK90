const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const SearchController = require("../controllers/searchController");
const upload = require("../helpers/multer");

router.use(authentication);

// Text-based search
router.post("/text", SearchController.searchByText);

// Voice-based search dengan Gemini AI
router.post("/voice", upload.single("audio"), SearchController.searchByVoice);

module.exports = router;
