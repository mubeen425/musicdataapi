const _ = require("lodash");
const db = require("../../models");
const fs = require('fs');

const Category = db.category;
const User = db.users;
const Music = db.music;
class MusicController {
    create = async (req, res) => {
        try {
            const music = _.pick(req.body, [
                "name",
                "categoryId",
                "artistId",
                "description",
                "musicPath",
                "isActive",
            ]);

            if (!req.file)
                return res.status(401).send({
                    message: "File is required."
                });

            music.musicPath = req.file.path;

            let foundUser = await User.findOne({
                where: {
                    id: req.body.artistId
                }
            });

            if (!foundUser)
                res.status(404).send({
                    message: "Artist not found"
                });

            let catInfo = await Category.findOne({
                raw: true,
                where: {
                    id: req.body.categoryId,
                },
            });

            if (catInfo) {
                const createdMusic = await Music.create(music);
                if (createdMusic) {
                    return res.status(201).send({
                        createdMusic
                    });
                }
                return res.status(501).send({
                    success: false,
                    message: error.message || "An error occured while creating the music."
                });
            }
            else {
                res.status(404).send({
                    message: "Category not found."
                });
            }
        } catch (err) {
            res.status(500).send({
                message: err.message || "Something Went Wrong"
            });
        }
    };

    getMusicById = async (req, res) => {
        try {
            let {
                id
            } = req.params;

            let music = await Category.findOne({
                where: {
                    isActive: true,
                    isDelete: false,
                },
                include: [{
                    model: Music,
                    where: {
                        id: id,
                        isActive: true,
                        isDelete: false,
                    },
                },],
            });
            if (!music)
                return res.status(404).send({
                    message: "Not found."
                });
            res
                .status(200)
                .send({
                    success: true,
                    message: "Successfully Get!",
                    data: music
                });
        } catch (err) {
            return res
                .status(403)
                .send({
                    message: err.message || "Something Went Wrong!"
                });
        }
    };

    getMusicByType = async (req, res) => {
        try {

            let music = await Category.findAll({
                where: {
                    isActive: true,
                    isDelete: false,
                },
                include: [{
                    model: Music,
                    where: {
                        categoryId: req.params.categoryType,
                        isActive: true,
                        isDelete: false,
                    },
                },],
            });
            res
                .status(200)
                .send({
                    success: true,
                    message: "Successfully Get!",
                    data: music
                });
        } catch (err) {
            return res
                .status(403)
                .send({
                    message: err.message || "Something Went Wrong!"
                });
        }
    };

    updateMusic = async (req, res) => {
        try {
            let music = _.pick(req.body, [
                "name",
                "description",
                "isActive",
                "artistId",
                "musicPath",
                "categoryId",
            ]);

            let foundUser = await User.findOne({
                where: {
                    id: req.body.artistId
                }
            });

            if (!foundUser)
                res.status(404).send({
                    message: "Artist not found"
                });

            let catInfo = await Category.findOne({
                raw: true,
                where: {
                    id: req.body.categoryId,
                },
            });

            let foundMusic = await Music.findOne({
                raw: true,
                where: {
                    id: req.params.musicId
                },
            });

            if (!catInfo)
                return res.status(200).send({
                    code: 404,
                    success: true,
                    message: "Category not found."
                });

            if (foundMusic) {
                if (req.file) {
                    fs.unlinkSync(foundMusic.musicPath);
                    music.musicPath = req.file.path;
                    let updatedSubCategory = await Music.update(music, {
                        where: {
                            id: req.params.musicId,
                            isActive: true
                        },
                    })
                    res.status(200).send({ message: "Successfully Updated" });
                }
                else {
                    let updatedSubCategory = await Music.update(music, {
                        where: {
                            id: req.params.musicId,
                            isActive: true
                        },
                    })
                        .then((data) => {
                            res.status(200).send({
                                success: true,
                                message: "Successfully Updated!"
                            });
                        })
                        .catch((err) => {
                            res.status(500).send({
                                success: false,
                                message: err.message ||
                                    "Some error occurred while updating the music.",
                            });
                        });
                }
            } else {
                res.status(200).send({
                    code: 404,
                    success: true,
                    message: "This music does not exist!"
                });
            }
        } catch (err) {
            res.status(500).send({
                success: false,
                message: err.message || "Something Went Wrong"
            });
        }
    };

    deleteMusic = async (req, res) => {
        try {
            let cat = {
                isDelete: true,
            };

            let foundMusic = await Music.findOne({
                where: {
                    id: req.params.musicId
                }
            });

            if (!foundMusic)
                return res.status(404).send({
                    message: "Not found."
                });

            Music.destroy({
                where: {
                    id: req.params.musicId,
                },
            }).then(data => {
                fs.unlinkSync(foundMusic.musicPath);
                res.status(200).send({
                    success: true,
                    message: "Music Deleted Successfully!",
                });
            }).catch(err => {
                res.status(400).send({ message: err.message });
            })

        } catch (err) {
            return res
                .status(500)
                .send({
                    success: false,
                    message: err.message || "Something Went Wrong!"
                });
        }
    };
}
module.exports = MusicController;