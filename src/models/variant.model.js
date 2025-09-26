const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");

// Define the variant schema
const variantSchema = new mongoose.Schema(
  {
    // Name of the variant
    variantName: {
      type: String,
      required: true,
      trim: true,
    },
    // Slug for the variant name
    slug: {
      type: String,
    },
    // Product the variant belongs to (reference to product model)
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // SKU (Stock Keeping Unit) for the variant
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    // Barcode for the variant
    barCode: {
      type: String,
    },
    // QR code for the variant
    qrCode: {
      type: String,
    },
    // Sizes available for this variant
    size: {
      type: String,
      required: true,
    },
    // Colors available for this variant
    color: [
      {
        type: String,
        required: true,
      },
    ],
    // Stock level for the variant
    stockVariant: {
      type: Number,
      required: true,
    },
    // Reference to the warehouse location
    warehouseLocation: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
    },
    // Alert stock level when it hits this threshold
    alertVariantStock: {
      type: Number,
      default: 0,
    },
    // Purchase price for the variant
    purchasePrice: {
      type: Number,
      required: true,
      default: 100,
    },
    // Retail price for the variant
    retailPrice: {
      type: Number,
      required: true,
    },

    // Wholesale price for the variant
    wholeSalePrice: {
      type: Number,
      required: true,
    },

    // Stock alert enabled or not
    stockAlert: {
      type: Boolean,
      default: false,
    },
    // Whether the variant is in stock
    instock: {
      type: Boolean,
      default: true,
    },
    // Whether the variant is active or not
    isActive: {
      type: Boolean,
      default: true,
    },
    image: [{}],
  },
  { timestamps: true }
);

// Pre-save hook to generate slug for variant name
variantSchema.pre("save", async function (next) {
  if (this.isModified("variantName")) {
    this.slug = slugify(this.variantName, {
      replacement: "-",
      lower: true,
      strict: true,
      locale: "vi",
      trim: true,
    });
  }
  next();
});

// Check if variant slug already exists
variantSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    slug: this.slug,
  });

  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(
      401,
      `${this.variantName} Already Exists. Try another one`
    );
  }
  next();
});

// Export the Variant model
module.exports =
  mongoose.models.Variant || mongoose.model("Variant", variantSchema);
