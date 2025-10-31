const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const brandController = require("../../controller/brand.controller");
const { authguard } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middle");
_.route("/create-brand").post(
  authguard,
  authorize("brand", "add"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  brandController.createBrand
);
_.route("/get-allbrand").get(brandController.getAllBrands);
_.route("/single-brand/:slug").get(brandController.singlebrand);
_.route("/update-brand/:slug").put(
  authguard,
  authorize("brand", "edit"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  brandController.updatebrand
);

_.route("/delete-brand/:slug").delete(
  authguard,
  authorize("brand", "delete"),
  brandController.deletebrand
);

module.exports = _;
