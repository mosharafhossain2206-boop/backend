const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const cartModel = require("../models/cart.model");
const { validateCart } = require("../validation/cart.validation");

// add to cart method
exports.addtoCart = asyncHandler(async (req, res) => {
  const data = await validateCart(req);
  console.log(
    "%csrccontrollercart.controller.js:10 data",
    "color: #007acc;",
    data
  );
});
