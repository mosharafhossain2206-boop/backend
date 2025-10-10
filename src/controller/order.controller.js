const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const orderModel = require("../models/order.model");
const cartModel = require("../models/cart.model");
const couponModel = require("../models/coupon.model");
const deliveryChargeModel = require("../models/deliveryCharge.model");
const { validateOrder } = require("../validation/order.validation");
const productModel = require("../models/product.model");
const variantModel = require("../models/variant.model");
const invoiceModel = require("../models/invoice.model");
const crypto = require("crypto");
const SSLCommerzPayment = require("sslcommerz-lts");
const { mailer } = require("../helpers/nodemailer");
const { orderTemplate, phoneTemplate } = require("../template/registration");
const { sendSms } = require("../helpers/sendSms");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "developement" ? false : true;
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
      followUp: req.user || null,
      totalQuantity: cart.totalQuantity,
    });
    // merge delivery charge
    const { name, deliveryCharge: deliveryChargeAmount } =
      await applyDeliveryCharge(deliveryCharge);
    order.discountAmount = cart.discountAmount || 0;
    order.discountType = cart.discountType;
    order.finalAmount = cart.finalAmount + deliveryChargeAmount;
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
      deliveryChargeAmount: deliveryChargeAmount,
    });

    // cash on delivery
    if (paymentMethod == "cod") {
      order.paymentMethod = "cod";
      order.paymentStatus = "Pending";
      order.transactionId = transactionId;
      order.orderStatus = "Pending";
      order.invoice = invoice.invoiceId;
    } else {
      const data = {
        total_amount: order.finalAmount,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/success`,
        fail_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/fail`,
        cancel_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/cancel`,
        ipn_url: `${process.env.BACKEND_URL}${process.env.BASE_API}/payment/ipn`,
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: shippingInfo.fullName,
        cus_email: shippingInfo.email || "customer@example.com",
        cus_add1: "Dhaka",
        cus_city: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: shippingInfo.phone || "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const response = await sslcz.init(data);

      // save the order info into order model
      await order.save();
      // send confirmation to user
      const template = orderTemplate(cart, shippingInfo, order.finalAmount);
      if (shippingInfo.email) {
        sendEmail(template, shippingInfo.email);
      } else {
        const text = phoneTemplate();
        SmsSender(shippingInfo.phone, text);
      }
      return apiResponse.sendSucess(res, 200, "payment initiate succesfull", {
        url: response.GatewayPageURL,
      });
    }

    // save the order info into order model
    await order.save();
    apiResponse.sendSucess(res, 201, "order placed sucessfully", order);
  } catch (error) {
    console.log(error);
    let allStockAdjustPromise = [];
    if (order && order._id) {
      for (let item of cart.items) {
        if (item.product) {
          allStockAdjustPromise.push(
            productModel.findOneAndUpdate(
              { _id: item.product._id },
              {
                $inc: { totalStock: item.quantity, totalSales: -item.quantity },
              }
            )
          );
        }
        // if varinat
        if (item.variant) {
          allStockAdjustPromise.push(
            variantModel.findOneAndUpdate(
              { _id: item.variant._id },
              {
                $inc: {
                  stockVariant: item.quantity,
                  totalSales: -item.quantity,
                },
              }
            )
          );
        }
      }
    }

    // coupon rollback
    allStockAdjustPromise.push(
      couponModel.findOneAndUpdate(
        { _id: cart.coupon._id },
        // { $inc: { usedCount: -1 } }
        { usedCount: cart.coupon.usedCount - 1 }
      )
    );
  }

  await Promise.all(allStockAdjustPromise);
});

// send email
const sendEmail = async (template, email) => {
  await mailer("order Confirm", template, email);
};

// send sms
const SmsSender = async (number, sms) => {
  const data = await sendSms(number, sms);
  console.log("sms sent", data);
};

// 📦 Order Confirmation
// Hello [Customer Name],
// Thank you for your order! Here are your order details:
// 🛒 Order Summary:
// ----------------------------------------
// Product Name      | Quantity | Total
// ----------------------------------------
// [Product 1 Name]   x [Qty]     = $[Total]
// [Product 2 Name]   x [Qty]     = $[Total]
// ...
// ----------------------------------------
// 🧾 Grand Total: $[Grand Total]
// 📅 Order Date: [Order Date]
// 🆔 Order ID: [Order ID]
// 📍 Shipping Address:
// [Customer Name]
// [Street Address]
// [City, State, ZIP]
// [Country]

// If you have any questions, feel free to contact us.
// Thanks for shopping with us!
// - [Your Company Name]
