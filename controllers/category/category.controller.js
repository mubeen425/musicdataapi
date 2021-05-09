const _ = require("lodash");
const db = require("../../models");
const {
    validate
} = require("../../models/category.model");

const Category = db.category;

class Categories {
    create = async (req, res) => {
        try {
            const {
                error
            } = validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const category = _.pick(req.body, [
                "name",
                "description",
                "isActive"
            ]);

            let _category = await Category.findOne({
                raw: true,
                where: {
                    name: req.body.name,
                },
            });

            if (_category) {
                res.status(200).send({
                    code: 429,
                    success: false,
                    message: "This category already exist!"
                });
            } else {
                Category.create(category)
                    .then((data) => {
                        res.status(200).send({ success: true, data });
                    })
                    .catch((err) => {
                        res.status(501).send({
                            success: false,
                            message: err.message ||
                                "Some error occurred while creating the category.",
                        });
                    });
            }
        } catch (err) {
            res.status(500).send({
                success: false,
                message: err.message || "Something Went Wrong!"
            });
        }
    };

    update = async (req, res) => {
        try {
            const {
                error
            } = validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            const category = _.pick(req.body, [
                "name",
                "description",
                "isActive",
                "isDelete"
            ]);

            let foundCategory = await Category.findOne({
                raw: true,
                where: {
                    id: req.params.categoryId
                },
            });

            if (!foundCategory)
                res.status(200).send({
                    code: 404,
                    success: false,
                    message: "Category not found."
                });

            Category.update(category, {
                where: {
                    id: req.params.categoryId,
                }
            })
                .then((data) => {
                    res.status(200).send({
                        success: true,
                        message: "Successfully Updated!"
                    });
                })
                .catch((err) => {
                    res.status(501).send({
                        success: false,
                        message: err.message ||
                            "Some error occurred while updating the category.",
                    });
                });
        } catch (err) {
            res.status(500).send({
                success: false,
                message: err.message || "Something Went Wrong"
            });
        }
    };

    getCategories = async (req, res) => {
        try {
            let categories = await Category.findAll({
                raw: true,
                where: {
                    isActive: true
                }
            });
            res
                .status(200)
                .send({
                    success: true,
                    message: "Successfully Get!",
                    data: categories
                });
        } catch (err) {
            return res
                .status(500)
                .send({
                    success: false,
                    message: err.message || "Something Went Wrong!"
                });
        }
    };

    getCategoryById = async (req, res) => {
        try {
            let category = await Category.findOne({
                raw: true,
                where: {
                    id: req.params.categoryId,
                    isActive: true
                },
            });
            if (!category)
                res.status(404).send({
                    success: false,
                    message: "Category not found."
                });

            res
                .status(200)
                .send({
                    success: true,
                    message: "Successfully Get!",
                    data: category
                });
        } catch (err) {
            return res
                .status(403)
                .send({
                    success: false,
                    message: err.message || "Something Went Wrong!"
                });
        }
    };

    deleteCategory = async (req, res) => {
        try {
            let cat = {
                isDelete: true,
                isActive: false,
            };
            let foundCategory = await Category.findOne({
                raw: true,
                where: {
                    id: req.params.categoryId
                },
            });

            if (!foundCategory)
                res.status(200).send({
                    code: 404,
                    success: false,
                    message: "Category not found."
                });

            let categories = await Category.update(cat, {
                where: {
                    id: req.params.categoryId,
                },
            });
            res.status(200).send({
                success: true,
                message: "Category deleted successfully!",
            });
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

module.exports = Categories;