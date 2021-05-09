const MusicController = require("../controllers/music/music.controller");

const router = require("express").Router();

const music = new MusicController();
const Token = require("../middleware/token");

router.post(
    "/create",
    Token.isAuthenticated(),
    music.create
);

router.get("/get/:musicType", Token.isAuthenticated(), music.getMusicByType);

router.get("/getById/:id", Token.isAuthenticated(), music.getMusicById);

router.put(
    "/updateMusic/:musicId",
    Token.isAuthenticated(),
    music.updateMusic
);

router.delete(
    "/deleteMusic/:musicId",
    Token.isAuthenticated(),
    music.deleteMusic
);

module.exports = router;