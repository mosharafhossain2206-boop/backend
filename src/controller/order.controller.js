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
const { axiosIns } = require("../helpers/axios");
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
      shippingInfo,
      deliveryCharge,
      paymentMethod,
      followUp: req.user || null,
      totalQuantity: cart.totalQuantity,
    });

    order.items = cart.items.map((item) => {
      if (item.product) {
        return {
          id: item.product._id,
          slug: item.product.slug,
          name: item.product.name,
          image: item.product.image,
          retailPrice: item.product.retailPrice,
          totalSales: item.product.totalSales,
        };
      }
      if (item.variant) {
        return {
          id: item.variant._id,
          slug: item.varinat.slug,
          name: item.variant.variantName,
          image: item.variant.image,
          retailPrice: item.variant.retailPrice,
          totalSales: item.variant.totalSales,
        };
      }
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
    order.transactionId = transactionId;
    // cash on delivery
    if (paymentMethod == "cod") {
      order.paymentMethod = "cod";
      order.paymentStatus = "Pending";
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
      // if (shippingInfo.email) {
      //   sendEmail(template, shippingInfo.email);
      // }
      // if (shippingInfo.phone) {
      //   const text = phoneTemplate();
      //   SmsSender(shippingInfo.phone, text);
      // }
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

// get all order
exports.getAllOrder = asyncHandler(async (req, res) => {
  const allorder = await orderModel.find().sort({ createAt: -1 });
  if (!allorder.length) throw new customError(401, "order no found !!");
  apiResponse.sendSucess(res, 200, "order retrive succesfully", allorder);
});

// update orderStatus and order shipping info
exports.updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, shippingInfo } = req.body;
  const allowedUpdates = ["Packaging", "Hold", "Confirmed", "Cancle"];
  const updated = await orderModel.findOneAndUpdate(
    { _id: id },
    {
      orderStatus: allowedUpdates.includes(status) && status,
      shippingInfo: { ...shippingInfo },
    },
    { new: true }
  );
  if (!updated) throw new customError(404, "Order not found !!");
  apiResponse.sendSucess(res, 200, "Order updated successfully", updated);
});

// get all orderStatus
exports.getTotalOrderStatusUpdate = asyncHandler(async (req, res) => {
  const getStatus = await orderModel.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
        totalAmount: { $sum: "$finalAmount" },
      },
    },
    {
      $group: {
        _id: null,
        statusWise: {
          $push: {
            status: "$_id",
            count: "$count",
            totalAmount: "$totalAmount",
          },
        },
        totalOrders: { $sum: "$count" },
      },
    },
    {
      $project: {
        _id: 0,
        statusWise: 1,
        totalOrders: 1,
      },
    },
  ]);

  apiResponse.sendSucess(res, 200, "get status succssfull", getStatus);
});

// send order into courier
exports.couriercreateOrder = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const order = await orderModel.findOne({
    _id: id,
  });
  const courierInfo = await axiosIns.post("/create_order", {
    invoice: order.transactionId,
    recipient_name: order.shippingInfo.fullName,
    recipient_phone: order.shippingInfo.phone,
    recipient_address: order.shippingInfo.address,
    cod_amount: order.finalAmount,
    note: req.body.note ? req.body.note : "",
  });

  if (courierInfo.data.status !== 200) {
    throw new customError(501, "not send order into courier");
  }
  order.courier.name = "steadfast";
  order.courier.trackingId = courierInfo.data.consignment.tracking_code;
  order.courier.status = courierInfo.data.consignment.status;
  order.courier.rawResponse = courierInfo.data.consignment;
  await order.save();
  apiResponse.sendSucess(
    res,
    200,
    "courier send sucessfully",
    courierInfo.data
  );
});

// weebhook intregation
exports.webhook = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log(req.headers);
  //   {
  //     "notification_type": "delivery_status",
  //     "consignment_id": 12345,
  //     "invoice": "INV-67890",
  //     "cod_amount": 1500.00,
  //     "status": "Delivered",
  //     "delivery_charge": 100.00,
  //     "tracking_message": "Your package has been delivered successfully.",
  //     "updated_at": "2025-03-02 12:45:30"
  // }

  try {
    await orderModel.findOneAndUpdate(
      {
        transactionId: req.body.invoice,
      },
      {
        "courier.status": req.body.status,
        "courier.rawResponse": req.body,
      }
    );
    return res.status(200).json({
      status: "success",
      message: "Webhook received successfully.",
    });
  } catch (error) {
    return res.status(200).json({
      status: "error",
      message: "Invalid consignment ID.",
    });
  }
});
