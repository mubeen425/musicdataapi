const UserController = require("../controllers/users/user.controller");
let Token = require("../middleware/token");
var Users = new UserController();
var router = require("express").Router();

/*************** USER ***************/
router.post("/create", Users.create);

router.get("/getAllUsers", Users.getAllUsers);

router.get("/verifyEmail/:token", Users.verifyEmail);

module.exports = router;
