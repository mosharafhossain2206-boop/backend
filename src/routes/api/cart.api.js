const express = require("express");
const _ = express.Router();
const cartController = require("../../controller/cart.controller");
_.route("/addtocart").post(cartController.addtoCart);
_.route("/decreasecart").post(cartController.decreaseQuantity);
_.route("/increasecart").post(cartController.increaseQuantity);
_.route("/deletecart").delete(cartController.deleteCartItem);

module.exports = _;
