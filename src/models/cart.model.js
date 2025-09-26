const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
    },
    guestid: {
      type: String,
      trim: true,
    },
    items: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: Types.ObjectId,
          ref: "Variant",
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price must be greater than 0"],
        },
        total: {
          type: Number,
          required: true,
          min: [0, "Total must be greater than 0"],
        },
        size: {
          type: String,
          default: "N/A",
        },
        color: {
          type: String,
          default: "N/A",
        },
      },
    ],
    coupon: {
      type: Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    afterApplyCouponPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
