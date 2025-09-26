const express = require("express");
const _ = express.Router();
const discountController = require("../../controller/discount.controller");
_.route("/create-discount").post(discountController.createDiscount);
_.route("/get-alldiscount").get(discountController.getAllDiscounts);
_.route("/single-discount/:slug").get(discountController.getSingleDiscount);
_.route("/update-discount/:slug").put(discountController.updateDiscount);
module.exports = _;
