const express = require("express");
const _ = express.Router();
const subCategoryController = require("../../controller/subcategory.controller");

_.route("/create-subcategory").post(subCategoryController.createSubCategory);
_.route("/all-subcategory").get(subCategoryController.getAllSubCategory);
_.route("/single-subcategory/:slug").get(
  subCategoryController.singleSubCategory
);
_.route("/update-subcategory/:slug").put(
  subCategoryController.updatesubCategory
);
_.route("/delete-subcategory/:slug").delete(
  subCategoryController.deletesubCategory
);

module.exports = _;
