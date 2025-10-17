const express = require("express");
const _ = express.Router();
const orderController = require("../../controller/order.controller");

// create order
_.route("/create-order").post(orderController.createOrder);
_.route("/all-order").get(orderController.getAllOrder);
_.route("/update-order/:id").put(orderController.updateOrder);
_.route("/order-status").get(orderController.getTotalOrderStatusUpdate);
_.route("/couriersend").post(orderController.couriercreateOrder);
_.route("/webhook").post(orderController.webhook);
module.exports = _;
