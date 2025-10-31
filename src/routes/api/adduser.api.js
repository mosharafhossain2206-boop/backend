const express = require("express");
const _ = express.Router();
const { upload } = require("../../middleware/multer.middleware");
const adduserpermissionController = require("../../controller/adduserpermission.controller");

_.route("/adduser").post(
  upload.fields([{ name: "image", maxCount: 1 }]),
  adduserpermissionController.adduser
);

_.route("/getuserbyadmin").get(adduserpermissionController.getAllUser);

module.exports = _;
