const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const brandController = require("../../controller/customerReview.controller");
_.route("/create-review").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  brandController.createReview
);

module.exports = _;
