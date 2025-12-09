const express = require("express");
const router = express.Router();
const SongsController = require("../controllers/songsController");
const { authentication } = require("../middlewares/authentication");
const { authorization } = require("../middlewares/authorization");

router.use(authentication);

router.post("/", SongsController.create);
router.get("/", SongsController.findAll);

router.get("/:id", SongsController.findOne);

router.put("/:id", authorization, SongsController.update);

router.delete("/:id", authorization, SongsController.delete);

module.exports = router;
