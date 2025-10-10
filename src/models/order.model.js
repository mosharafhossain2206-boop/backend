const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    // USER INFO (Registered or Guest)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestId: {
      type: String, // For guest users tracking
      default: null,
    },

    // ORDER ITEMS SNAPSHOT
    items: [
      // {
      //   productId: {
      //     type: mongoose.Schema.Types.ObjectId,
      //     ref: "Product",
      //     required: true,
      //   },
      //   name: String,
      //   quantity: Number,
      //   totalPrice: Number,
      //   retailPrice: Number,
      //   size: String,
      //   color: String,
      // },
    ],

    // SHIPPING INFO
    shippingInfo: {
      fullName: { type: String, required: false },
      phone: { type: String },
      address: { type: String, required: false },
      email: { type: String },
      country: {
        type: String,
        default: "Bangladesh",
      },
      deliveryZone: String,
    },

    productWeight: { type: Number, default: 0 }, // in grams
    // DELIVERY CHARGE
    deliveryCharge: {
      type: mongoose.Types.ObjectId,
      ref: "DeliveryCharge",
    },

    discountAmount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
    },

    // FINAL AMOUNTS
    finalAmount: {
      type: Number,
      required: true,
    },
    // PAYMENT INFO
    paymentMethod: {
      type: String,
      enum: ["cod", "sslcommerz"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "success", "failed", "cancelled"],
      default: "Pending",
    },
    payementInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // SSLCommerz Payment Gateway Specific
    transactionId: {
      type: String, // sslcommerz transaction_id
      default: null,
    },
    valId: {
      type: String, // sslcommerz val_id used to verify
      default: null,
    },

    paymentGatewayData: {
      type: mongoose.Schema.Types.Mixed, // store full SSLCommerz response if needed
      default: {},
    },

    // ORDER STATUS
    orderStatus: {
      type: String,
      enum: ["Pending", "Hold", "Confirmed", "Packaging"],
      default: "Pending",
    },

    // INVOICE ID (Optional)
    invoiceId: {
      type: String,
      default: null,
    },
    // COURIER
    courier: {
      name: {
        type: String,
        default: null,
      },
      trackingId: { type: String, default: null },
      rawResponse: { type: mongoose.Schema.Types.Mixed, default: null },
      status: {
        type: String,
        default: "pending",
      },
    },

    followUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    totalQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
