const express = require("express");
const _ = express.Router();
const deliveryChargeController = require("../../controller/deliveryCharge.controller");
_.route("/create-delivery-charge").post(
  deliveryChargeController.createDeliveryCharge
);

_.route("/get-delivery-charge").get(deliveryChargeController.getDeliveryCharge);
_.route("/get-delivery-charge/:id").get(
  deliveryChargeController.getDeliveryChargeById
);
_.route("/update-delivery-charge/:id").put(
  deliveryChargeController.updateDeliveryChargeById
);

_.route("/delete-delivery-charge/:id").delete(
  deliveryChargeController.deleteDeliveryChargeById
);
module.exports = _;
