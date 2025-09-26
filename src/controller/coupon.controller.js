const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const couponModel = require("../models/coupon.model");

// create coupon
exports.createCoupon = asyncHandler(async (req, res) => {
  const data = await couponModel.create(req.body);
  if (!data) throw new customError(500, "Coupon create Failed !!");
  apiResponse.sendSucess(res, 201, "Coupon created", data);
});
// get all coupon
exports.getAllCoupon = asyncHandler(async (req, res) => {
  const data = await couponModel.find();
  if (!data) throw new customError(500, "Coupon not found !!");
  apiResponse.sendSucess(res, 200, "Coupon found", data);
});

// get single coupon
exports.getSingleCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await couponModel.findOne({ _id: id });
  if (!data) throw new customError(500, "Coupon not found !!");
  apiResponse.sendSucess(res, 200, "Coupon found", data);
});

//update coupon
exports.updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await couponModel.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    {
      new: true,
    }
  );
  if (!data) throw new customError(500, "Coupon not found !!");
  apiResponse.sendSucess(res, 200, "Coupon updated", data);
});
