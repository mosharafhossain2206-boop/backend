const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const deliveryChargeModel = require("../models/deliveryCharge.model");
const { validateOrder } = require("../validation/order.validation");
const productModel = require("../models/product.model");
const variantModel = require("../models/variant.model");
const invoiceModel = require("../models/invoice.model");
const crypto = require("crypto");
const { log } = require("console");

// apply deliveryCharge method
const applyDeliveryCharge = async (dcId) => {
  try {
    const deliveryCharge = await deliveryChargeModel.findOne({ _id: dcId });
    if (!deliveryCharge)
      throw new customError(401, "Invalid delivery charge ID");
    return deliveryCharge;
  } catch (error) {
    throw new customError(401, "applyDeliveryCharge issues" + error);
  }
};

// create order
exports.createOrder = asyncHandler(async (req, res) => {
  const { user, guestId, shippingInfo, deliveryCharge, paymentMethod } =
    await validateOrder(req);

  // 1) find the user or guestId into cart model
  const query = user ? { user } : { guestid: guestId };
  const cart = await cartModel
    .findOne(query)
    .populate("items.product")
    .populate("items.variant")
    .populate("coupon");

  // reduce stock
  let allStockAdjustPromise = [];
  for (let item of cart.items) {
    if (item.product) {
      allStockAdjustPromise.push(
        productModel.findOneAndUpdate(
          { _id: item.product._id },
          { $inc: { totalStock: -item.quantity, totalSales: item.quantity } },
          { new: true }
        )
      );
    }
    // if varinat
    if (item.variant) {
      allStockAdjustPromise.push(
        variantModel.findOneAndUpdate(
          { _id: item.variant._id },
          { $inc: { stockVariant: -item.quantity, totalSales: item.quantity } },
          { new: true }
        )
      );
    }
  }
  // create order instace
  let order = null;
  try {
    order = new orderModel({
      user: user,
      guestId: guestId,
      items: cart.items,
      shippingInfo,
      deliveryCharge,
      paymentMethod,
      followUp: req.user || "",
      totalQuantity: cart.totalQuantity,
    });

    // merge delivery charge
    const { name, deliveryCharge } = await applyDeliveryCharge(deliveryCharge);

    order.discountAmount = cart.discountAmount || 0;
    order.discountType = cart.discountType;
    order.finalAmount = cart.finalAmount + deliveryCharge;
    order.shippingInfo.deliveryZone = name;

    // payment
    const transactionId = `INV-${crypto
      .randomUUID()
      .split("-")[0]
      .toLocaleUpperCase()}`;
    // make invoice database
    const invoice = await invoiceModel.create({
      invoiceId: transactionId,
      order: order._id,
      customerDetails: shippingInfo,
      finalAmount: order.finalAmount,
      discountAmount: order.discountAmount,
      deliveryChargeAmount: deliveryCharge,
    });

    // cash on delivery
    if (paymentMethod == "cod") {
      order.paymentMethod = "cod";
      order.paymentStatus = "Pending";
      order.transactionId = transactionId;
      order.orderStatus = "Pending";
      order.invoice = invoice.invoiceId;
    } else {
      
    }
  } catch (error) {}
});
