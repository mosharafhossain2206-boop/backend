const express = require("express");
const _ = express.Router();
const couponController = require("../../controller/coupon.controller");
_.route("/create-coupon").post(couponController.createCoupon);
_.route("/all-coupon").get(couponController.getAllCoupon);
_.route("/single-coupon/:id").get(couponController.getSingleCoupon);
_.route("/update-coupon/:id").put(couponController.updateCoupon);
module.exports = _;
