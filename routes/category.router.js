const CategoryController = require("../controllers/category/category.controller");

const router = require("express").Router();

const Category = new CategoryController();
const Token = require("../middleware/token");

router.post("/create", Token.isAuthenticated(), Category.create);

router.put("/updateCategory/:categoryId", Token.isAuthenticated(), Category.update);

router.get("/getCategories", Token.isAuthenticated(), Category.getCategories);

router.get("/getCategoryById/:categoryId", Token.isAuthenticated(), Category.getCategoryById);

router.delete("/deleteCategory/:categoryId", Token.isAuthenticated(), Category.deleteCategory);

module.exports = router;