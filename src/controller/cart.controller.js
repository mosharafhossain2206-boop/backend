const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const cartModel = require("../models/cart.model");
const productModel = require("../models/product.model");
const couponModel = require("../models/coupon.model");
const variantModel = require("../models/variant.model");
const { validateCart } = require("../validation/cart.validation");
const { default: mongoose } = require("mongoose");

// apply coupon
const applyCoupoun = async (totalPrice, couponCode) => {
  if (!couponCode) return totalPrice;

  try {
    let afterDiscountPrice = 0;
    const coupon = await couponModel.findOne({ code: couponCode });

    if (!coupon) throw new customError(400, "coupon not found !!");
    // check expire date
    if (Date.now() >= coupon.expireAt)
      throw new customError(400, "coupon date expired !!");

    if (coupon.usedCount >= coupon.usageLimit)
      throw new customError(400, "coupon userd limit expired !!");
    if (coupon.discountType == "percentage") {
      coupon.usedCount += 1;
      discountAmout = Math.ceil((totalPrice * coupon.discountValue) / 100);
      afterDiscountPrice = totalPrice - discountAmout;
    }
    if (coupon.discountType == "tk") {
      coupon.usedCount += 1;
      afterDiscountPrice = Math.ceil(totalPrice - coupon.discountValue);
    }
    await coupon.save();
    return {
      afterApplyCouponPrice: afterDiscountPrice,
      discountType: coupon.discountType,
      discountAmount: coupon.discountValue,
      couponId: coupon._id,
    };
  } catch (error) {
    console.log("error apply coupon", error);
  }
};

// add to cart method
exports.addtoCart = asyncHandler(async (req, res) => {
  const data = await validateCart(req);
  let product = null;
  let variant = null;
  let price = 0;

  if (data.product) {
    product = await productModel.findById(data.product);
    if (!product) throw new customError(500, "product not fond !!");
    price = product.retailPrice;
  }

  if (data.variant) {
    variant = await variantModel.findById(data.variant);
    if (!variant) throw new customError(500, "variant not fond !!");
    price = variant.retailPrice;
  }

  // find user or guestid into cart model
  let cartQuery = {};
  if (data.user) {
    cartQuery = { user: data.user };
  } else {
    cartQuery = { guestid: data.guestid };
  }
  let cart = await cartModel.findOne(cartQuery);
  if (!cart) {
    cart = new cartModel({
      user: data.user || null,
      guestid: data.guestid || null,
      items: [],
    });
  }
  // find product or varint into cart
  let findIndex = -1;
  if (variant) {
    findIndex = cart.items.findIndex((item) => item.variant == data.variant);
  } else {
    findIndex = cart.items.findIndex((item) => item.product == data.product);
  }

  // now update the item field
  if (findIndex > -1) {
    cart.items[findIndex].quantity += data.quantity;
    cart.items[findIndex].totalPrice = Math.round(
      cart.items[findIndex].quantity * price
    );
  } else {
    cart.items.push({
      product: data.product ? data.product : null,
      variant: data.variant ? data.variant : null,
      quantity: data.quantity,
      price: price,
      totalPrice: Math.ceil(price * data.quantity),
      size: data.size,
      color: data.color,
    });
  }

  // calculate totalPrice
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );

  const { totalPrice, totalQuantity } = totalCartItemPrice;
  const afterApplyCoupon = await applyCoupoun(totalPrice, data.coupon);

  // now update the cart model
  if (typeof afterApplyCoupon == "object") {
    cart.coupon = afterApplyCoupon.couponId || null;
    cart.grossTotalAmount = totalPrice;
    cart.totalQuantity = totalQuantity;
    cart.finalAmount = afterApplyCoupon.afterApplyCouponPrice;
    cart.discountType = afterApplyCoupon.discountType;
    cart.discountAmount = afterApplyCoupon.discountAmount;
  } else {
    cart.finalAmount = totalPrice;
    cart.totalQuantity = totalQuantity;
  }

  // save the data into database
  await cart.save();
  apiResponse.sendSucess(res, 201, "add to cart sucessfully", cart);
});

// decrease quantity
exports.decreaseQuantity = asyncHandler(async (req, res) => {
  const user = req.userId || req.body.user;
  const { guestid, cartItemId } = req.body;

  // find the user or guest _id
  let Query = user ? { user: user } : { guestid: guestid };
  const cart = await cartModel.findOne(Query);
  // find the acutal item
  const indexNumber = cart.items.findIndex((item) => item._id == cartItemId);
  const targetCartItem = cart.items[indexNumber];

  if (targetCartItem.quantity > 1) {
    targetCartItem.quantity = targetCartItem.quantity - 1;
    targetCartItem.totalPrice = targetCartItem.price * targetCartItem.quantity;
  } else {
    throw new customError(401, "at least have one item ");
  }
  // calculate totalPrice
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );
  const { totalPrice, totalQuantity } = totalCartItemPrice;
  cart.grossTotalAmount = totalPrice;
  cart.finalAmount = totalPrice;
  cart.totalQuantity = totalQuantity;
  await cart.save();
  apiResponse.sendSucess(res, 201, " cart  item decrease sucessfully", cart);
});

// increase cart item
exports.increaseQuantity = asyncHandler(async (req, res) => {
  const user = req.userId || req.body.user;
  const { guestid, cartItemId } = req.body;

  // find the user or guest _id
  let Query = user ? { user: user } : { guestid: guestid };
  const cart = await cartModel.findOne(Query);
  // find the acutal item
  const indexNumber = cart.items.findIndex((item) => item._id == cartItemId);
  const targetCartItem = cart.items[indexNumber];

  if (targetCartItem.quantity > 1) {
    targetCartItem.quantity = targetCartItem.quantity + 1;
    targetCartItem.totalPrice = targetCartItem.price * targetCartItem.quantity;
  } else {
    throw new customError(401, "at least have one item ");
  }
  // calculate totalPrice
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    {
      totalPrice: 0,
      totalQuantity: 0,
    }
  );
  const { totalPrice, totalQuantity } = totalCartItemPrice;
  cart.grossTotalAmount = totalPrice;
  cart.finalAmount = totalPrice;
  cart.totalQuantity = totalQuantity;
  await cart.save();
  apiResponse.sendSucess(res, 201, " cart  item increase sucessfully", cart);
});

// delete cart item
exports.deleteCartItem = asyncHandler(async (req, res) => {
  const user = req.userId || req.body.user;
  const { guestid, cartItemId } = req.body;

  // find the user or guest _id
  let Query = user ? { user: user } : { guestid: guestid };

  const cart = await cartModel.findOneAndUpdate(
    Query,
    {
      $pull: { items: { _id: new mongoose.Types.ObjectId(cartItemId) } },
    },
    { new: true }
  );

  if (!cart) {
    return apiResponse.sendError(res, 404, "Cart not found");
  }

  // if no items left → delete entire cart
  if (cart.items.length === 0) {
    await cartModel.deleteOne({ _id: cart._id });
    return apiResponse.sendSucess(res, 201, "Cart removed successfully", null);
  }

  // calculate totalPrice for remaining items
  const totalCartItemPrice = cart.items.reduce(
    (acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.totalQuantity += item.quantity;
      return acc;
    },
    { totalPrice: 0, totalQuantity: 0 }
  );

  const { totalPrice, totalQuantity } = totalCartItemPrice;
  cart.grossTotalAmount = totalPrice;
  cart.finalAmount = totalPrice;
  cart.totalQuantity = totalQuantity;
  await cart.save();

  apiResponse.sendSucess(res, 201, "Cart item removed successfully", cart);
});
