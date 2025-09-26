const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const brandController = require("../../controller/brand.controller");
_.route("/create-brand").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  brandController.createBrand
);
_.route("/get-allbrand").get(brandController.getAllBrands);
_.route("/single-brand/:slug").get(brandController.singlebrand);
_.route("/update-brand/:slug").put(
  upload.fields([{ name: "image", maxCount: 1 }]),
  brandController.updatebrand
);

_.route("/delete-brand/:slug").delete(brandController.deletebrand);

module.exports = _;
