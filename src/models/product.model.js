const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");
const { required } = require("joi");

// revies scheam
const reviewSchema = new mongoose.Schema(
  {
    reviewerid: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    image: [{}],
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: {
      type: mongoose.Types.ObjectId,
      ref: "SubCategory",
    },
    brand: {
      type: mongoose.Types.ObjectId,
      ref: "Brand",
    },
    discount: {
      type: mongoose.Types.ObjectId,
      ref: "Discount",
      default: null,
    },
    image: [{}],
    tag: [
      {
        type: String,
        trim: true,
      },
    ],
    manufactureCountry: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    warrantyInformation: {
      type: mongoose.Types.ObjectId,
      ref: "Warranty",
    },
    shippingInformation: {
      type: mongoose.Types.ObjectId,
      ref: "ShippingInfo",
    },
    variant: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Variant",
      },
    ],
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    sku: {
      type: String,
      trim: true,
      unique: true,
    },
    qrCode: {
      type: String,
    },
    barCode: {
      type: String,
    },
    groupUnit: {
      type: String,
      enum: ["Box", "Packet", "Dozen", "Custom"],
    },
    groupUnitQuantity: {
      type: Number,
      default: 1,
    },
    unit: {
      type: String,
      enum: ["Piece", "Kg", "Gram", "Packet", "Liter"],
    },
    size: [
      {
        type: String,
      },
    ],
    color: [
      {
        type: String,
      },
    ],
    totalStock: {
      type: Number,
      default: 0,
    },
    warehouseLocation: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
    },
    purchasePrice: {
      type: Number,
      min: 100,
    },
    retailPrice: {
      type: Number,
    },
    wholeSalePrice: {
      type: Number,
    },
    minimunWholeSaleOrderQuantity: {
      type: Number,
      min: 100,
      default: 100,
    },
    minimumOrder: {
      type: Number,
      default: 1,
    },
    instock: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    variantType: {
      type: String,
      enum: ["multiple", "single"],
    },
    totalSales: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// slugify before save
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: false,
      strict: false,
      locale: "vi",
      trim: true,
    });
  }
  next();
});

// check slug uniqueness
productSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    slug: this.slug,
  });

  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, `${this.name} Already Exists. Try another one.`);
  }
  next();
});

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
