const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const orderModel = require("../models/order.model");
const SSLCommerzPayment = require("sslcommerz-lts");
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = process.env.NODE_ENV == "developement" ? false : true;

// sucess method

exports.success = asyncHandler(async (req, res) => {
  const { val_id } = req.body;

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const data = await sslcz.validate({
    val_id,
  });

  const { tran_id, status } = data;
  await orderModel.findOneAndUpdate(
    { transactionId: tran_id },
    {
      paymentStatus: status == "VALID" && "success",
      payementInfo: data,
      valId: status,
      orderStatus: "Confirmed",
    }
  );
  apiResponse.sendSucess(res, 200, "payment sucessfully", null);
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
