const db = require("../../models");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const moment = require("moment");

const {
    deleteUserStateToken,
    getUserStateToken
} = require(
    "../../cache/redis.service"
);
const ForgetPasswordEmailSend = require("../../helpers/ForgetPasswordSend");
const sendVerificationEmail = require("../../helpers/EmailverificationSend");
const forgetpassword = require("../../helpers/ForgetPasswordVerification");
const generateTokenWithResp = require("../../helpers/genTokenWithResp");

moment.fn.fromNow_seconds = function (a) {
    let duration = moment(this).diff(moment(), 'seconds');
    return duration;
}

const Users = db.users;
const forgetpasswordtable = db.ForgetPassword;

class Authentication {
    Auth = async (req, res) => {
        const {
            error
        } = validation(req.body);
        if (error)
            return res
                .status(400)
                .send(error.details[0].message);

        Users
            .findOne({
                raw: true,
                where: {
                    email: req.body.email,
                    emailVerified: true
                }
            })
            .then(async (result) => {
                if (result) {
                    let password = await bcrypt.compare(req.body.password, result.password);
                    if (!password)
                        return res
                            .status(400)
                            .send({
                                message: "Invalid Email Or Password!"
                            });

                    try {
                        await generateTokenWithResp(req, res, result.id, result);
                    } catch (err) {
                        return res.send(err.message);
                    }

                } else {
                    res
                        .status(401)
                        .send({
                            message: "Invalid Email Or Password!!."
                        });
                }
            })
            .catch((err) => {
                res
                    .status(500)
                    .send({
                        message: err.message
                    });
            });
    };

    Google = async (req, res) => {
        let { name, email } = req.user._json;
        let splitName = name.split(' ');
        let concatName = splitName[0] + splitName[1];
        try {
            let foundUser = await Users.findOne({
                raw: true,
                where: {
                    email: email
                }
            });
            if (foundUser) {
                await generateTokenWithResp(req, res, foundUser.id, foundUser);
            }
            else {
                let userObj = {
                    userName: concatName,
                    email: email,
                    userType: "google",
                    emailVerified: true
                }
                let newUser = await Users.create(userObj);
                if (newUser) {
                    await generateTokenWithResp(req, res, newUser.id, newUser);
                }
            }
        }
        catch (err) {
            res.status(500).send({ message: err.message });
        }
    }

    Facebook = async (req, res) => {
        let { first_name, last_name, email } = req.user._json;
        let concatName = first_name + last_name;
        try {
            let foundUser = await Users.findOne({
                raw: true,
                where: {
                    email: email
                }
            });
            if (foundUser) {
                await generateTokenWithResp(req, res, foundUser.id, foundUser);
            }
            else {
                let userObj = {
                    userName: concatName,
                    email: email,
                    userType: "facebook",
                    emailVerified: true
                }
                let newUser = await Users.create(userObj);
                if (newUser) {
                    await generateTokenWithResp(req, res, newUser.id, newUser);
                }
            }
        }
        catch (err) {
            res.status(500).send({ message: err.message });
        }
    }

    Logout = async (req, res) => {
        getUserStateToken(req.auth).then(data => {
            if (data == null) {
                console.log("Expired Token!")
                res.status(401).send({
                    success: true,
                    message: "Logged out successfully",
                    code: 200,
                });
                return;
            } else {
                console.log("Non Expired Token!")
                deleteUserStateToken(req.auth)
                    .then(success => {
                        if (success) {
                            res.send({
                                success: true,
                                message: "Logged out successfully!"
                            })
                        }
                    })
                    .catch((err) => {
                        res
                            .status(500)
                            .send(err);
                    })
            }
        })
    };

    ForgetpasswordEmail = (req, res) => {
        const email = req.body.email;
        if (email) {
            Users
                .findOne({
                    raw: true,
                    where: {
                        email: email,
                    }
                })
                .then((result) => {
                    const url = req.protocol + "://" + req.get("host");
                    if (result && result.emailVerified == true) {
                        console.log(result);
                        ForgetPasswordEmailSend(
                            url,
                            req,
                            res,
                            result.id,
                            result.email,
                            result.userName
                        );
                    } else if (result && result.emailVerified == false) {
                        sendVerificationEmail(url, req, res, result.id, result.email, result.userName);
                    } else {
                        res.status(409).send({
                            message: "User Not Found"
                        })
                    }

                })
                .catch((err) => {
                    res.send(err.message);
                });
        } else {
            res.send({
                message: "Please Enter A email"
            });
        }
    };

    Template = (req, res) => {
        const token = req.params.key;

        forgetpassword(token, res)
            .then((res) => res)
            .catch((err) => console.log(err.message));
    };

    ResetPassword = async (req, res) => {
        let token = req.params.token;
        let password = req.body.password;

        const salt = await bcrypt.genSalt(10);
        let passwordhased = await bcrypt.hash(password, salt);

        forgetpasswordtable
            .findOne({
                raw: true,
                where: {
                    token: token
                }
            })
            .then((result) => {
                Users
                    .update({
                        password: passwordhased
                    }, {
                        where: {
                            id: result.userId
                        }
                    })
                    .then((result) => {
                        forgetpasswordtable
                            .update({
                                isExpired: true
                            }, {
                                where: {
                                    token: token
                                }
                            })
                            .then((result) => res.send({
                                message: "Password Successfully Updated"
                            }));
                    });
            });
    };
}

function validation(request) {
    const schema = {
        email: Joi
            .string()
            .required()
            .email(),
        password: Joi
            .string()
            .required()
    };

    return Joi.validate(request, schema);
}

module.exports = Authentication;
