var router = require("express").Router();
const AuthController = require("../controllers/users/auth.controller");
const Token = require('../middleware/token');
const passport = require('../config/passportConfig');

let Auth = new AuthController();

router.post("/login", Auth.Auth);

router.post("/logout", Token.isValid(), Auth.Logout);

router.post("/ForgetPassword", Auth.ForgetpasswordEmail);

// Template Generator
router.get('/dynamic_gen_token_key/template/:key', Auth.Template);

// Template Generator
router.post('/reset/:token', Auth.ResetPassword);

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get('/google/redirect',
    passport.authenticate('google', { failureRedirect: '/login' }),
    Auth.Google
);

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/redirect',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    }),
    (req, res) => {
        res.redirect('/');
    }
);

router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/redirect', passport.authenticate('twitter', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

module.exports = router;