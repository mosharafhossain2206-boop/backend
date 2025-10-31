const express = require("express");
const _ = express.Router();
const categoryController = require("../../controller/category.controller");
const { upload } = require("../../middleware/multer.middleware");
const { authguard } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middle");
_.route("/create-category").post(
  authguard,
  authorize("category", "add"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.createCategory
);
_.route("/get-allcategory").get(categoryController.getAllCategory);
_.route("/single-category/:slug").get(categoryController.singleCategory);

_.route("/update-category/:slug").put(
  authguard,
  authorize("category", "edit"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  categoryController.updateCategory
);
_.route("/delete-category/:slug").delete(
  authguard,
  authorize("category", "delete"),
  categoryController.deleteCategory
);
_.route("/category").get(
  authguard,
  authorize("category", "view"),
  categoryController.activeCategory
);
module.exports = _;
