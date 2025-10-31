const express = require("express");
const _ = express.Router();
const adduserpermissionController = require("../../controller/adduserpermission.controller");

_.route("/adduserpermission").post(
  adduserpermissionController.addPermissionToUser
);

module.exports = _;
