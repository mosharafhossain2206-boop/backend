const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const deliveryChargeModel = require("../models/deliveryCharge.model");

// create delivery charge
exports.createDeliveryCharge = asyncHandler(async (req, res) => {
  const { name, deliveryCharge, description } = req.body;
  if (!name || !deliveryCharge) {
    throw new customError(400, "Name and delivery charge are required");
  }
  //save to db
  const deliveryChargeInstance = new deliveryChargeModel({
    name,
    deliveryCharge,
    description,
  });
  await deliveryChargeInstance.save();
  if (!deliveryChargeInstance)
    throw new customError(500, "Delivery charge creation failed");
  apiResponse.sendSucess(
    res,
    200,
    "Delivery charge created successfully",
    deliveryChargeInstance
  );
});

// get delivery charge
exports.getDeliveryCharge = asyncHandler(async (req, res) => {
  const deliveryCharges = await deliveryChargeModel
    .find()
    .sort({ createdAt: -1 });

  if (!deliveryCharges.length)
    throw new customError(404, "No delivery charges found");
  apiResponse.sendSucess(
    res,
    200,
    "Delivery charges fetched successfully",
    deliveryCharges
  );
});

// get deliveryCharge by id
exports.getDeliveryChargeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deliveryCharge = await deliveryChargeModel.findById(id);
  if (!deliveryCharge) throw new customError(404, "Delivery charge not found");
  apiResponse.sendSucess(
    res,
    200,
    "Delivery charge fetched successfully",
    deliveryCharge
  );
});

// update delivery charge by id
exports.updateDeliveryChargeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new customError(400, "Delivery charge id is required");
  const updatedDeliveryCharge = await deliveryChargeModel.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );
  if (!updatedDeliveryCharge)
    throw new customError(500, "Delivery charge update failed");
  apiResponse.sendSucess(
    res,
    200,
    "Delivery charge updated successfully",
    updatedDeliveryCharge
  );
});

// delete delivery charge by id
exports.deleteDeliveryChargeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new customError(400, "Delivery charge id is required");
  const deletedDeliveryCharge = await deliveryChargeModel.findOneAndDelete({
    _id: id,
  });
  if (!deletedDeliveryCharge)
    throw new customError(500, "Delivery charge deletion failed");
  apiResponse.sendSucess(
    res,
    200,
    "Delivery charge deleted successfully",
    deletedDeliveryCharge
  );
});
