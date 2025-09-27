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
          default: null,
        },
        variant: {
          type: Types.ObjectId,
          ref: "Variant",
          default: null,
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
        totalPrice: {
          type: Number,
          required: true,
          min: [0, "totalPrice must be greater than 0"],
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
    grossTotalAmount: {
      type: Number,
      default: 0,
    },
    totalQuantity: { type: Number, default: 0 },

    finalAmount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      default: "N/A",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
