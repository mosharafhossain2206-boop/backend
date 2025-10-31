const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const bannerController = require("../../controller/banner.controller");
const { authguard } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middle");
_.route("/create-banner").post(
  //   authguard,
  //   authorize("brand", "add"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  bannerController.createBanner
);

_.route("/get-banner").get(bannerController.getBanner);
_.route("/update-banner/:bannerId").post(
  //   authguard,
  //   authorize("brand", "add"),
  upload.fields([{ name: "image", maxCount: 1 }]),
  bannerController.updateBanner
);

_.route("/delete-banner/:bannerId").post(
  //   authguard,
  //   authorize("brand", "add"),
  bannerController.deleteBanner
);

module.exports = _;
