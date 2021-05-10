const jwt = require("jsonwebtoken");
const fs = require("fs");
const moment = require("moment");
let privateKEY = fs.readFileSync('config/cert/private.key', 'utf8');
const { setUserStateToken } = require("../cache/redis.service");

generateTokenWithResp = async (req, res, userId, newUser) => {
    let Token = AuthTokenGen(userId);

    setUserStateToken(Token, moment(moment().add(48, 'hours')).fromNow_seconds())
        .then(
            (success) => {
                console.log("Refresh Token Recorded")
            }
        )
        .catch((error) => {
            console.log(error);
            res.json(error);
        });
    res.header("x-auth-token", Token);
    res.status(201).send({
        data: newUser,
        accessToken: Token
    });
}

function AuthTokenGen(id) {
    var i = "logicsyard";
    var s = "logicsyard@gmail.com";
    var signOptions = {
        issuer: i,
        subject: s,
        algorithm: "RS256"
    };
    var payload = {
        id: id
    };
    // jwt.sign(payload, config.get("JWT.privateKey"))
    var token = jwt.sign(payload, privateKEY, signOptions);
    // This function is pushing the jwt to a cache Any jwt not in this cache is not
    // usable
    return token;
}

module.exports = generateTokenWithResp;