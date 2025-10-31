const express = require("express");
const _ = express.Router();
const subCategoryController = require("../../controller/subcategory.controller");
const { authguard } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middle");
_.route("/create-subcategory").post(
  authguard,
  authorize("subcategory", "add"),
  subCategoryController.createSubCategory
);
_.route("/all-subcategory").get(subCategoryController.getAllSubCategory);
_.route("/single-subcategory/:slug").get(
  subCategoryController.singleSubCategory
);
_.route("/update-subcategory/:slug").put(
  authguard,
  authorize("subcategory", "edit"),
  subCategoryController.updatesubCategory
);
_.route("/delete-subcategory/:slug").delete(
  authguard,
  authorize("subcategory", "delete"),
  subCategoryController.deletesubCategory
);

module.exports = _;
