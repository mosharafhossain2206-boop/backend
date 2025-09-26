const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const variantController = require("../../controller/varinat.controller");
_.route("/create-variant").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.createVariant
);
_.route("/get-allvariant").get(variantController.getAllVariants);
_.route("/single-variant/:slug").get(variantController.getSingleVariant);
_.route("/upload-variantimage/:slug").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  variantController.uploadVariantImage
);
_.route("/upload-variantinfo/:slug").put(variantController.updateVariantinfo);

module.exports = _;
