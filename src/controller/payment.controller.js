const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const orderModel = require("../models/order.model");

// sucess method

exports.success = asyncHandler(async (req, res) => {
  console.log(req.body);
  return res.redirect("https://www.youtube.com/watch?v=t0Q2otsqC4I");
});

exports.fail = asyncHandler(async (req, res) => {
  console.log(req.body);
  return res.redirect("https://www.youtube.com/watch?v=t0Q2otsqC4I");
});
exports.cancel = asyncHandler(async (req, res) => {
  console.log(req.body);
  return res.redirect("https://www.youtube.com/watch?v=t0Q2otsqC4I");
});
exports.ipn = asyncHandler(async (req, res) => {
  console.log(req.body);
  return res.redirect("https://www.youtube.com/watch?v=t0Q2otsqC4I");
});
