const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");

const discountSchema = new mongoose.Schema(
  {
    discountValidFrom: {
      type: Date,
      required: [true, "Discount start date is required"],
    },
    discountValidTo: {
      type: Date,
      required: [true, "Discount end date is required"],
    },
    discountName: {
      type: String,
      required: [true, "Discount name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    discountType: {
      type: String,
      enum: ["tk", "percentance"], // tk = amount, percent = %
      required: [true, "Discount type is required"],
    },
    discountValueByAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    discountValueByPercentance: {
      type: Number,
      default: 0,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
    },
    discountPlan: {
      type: String,
      enum: ["category", "subCategory", "product", "flat"],
      required: [true, "Discount plan is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔹 Auto-generate slug from discountName
discountSchema.pre("save", function (next) {
  if (this.isModified("discountName")) {
    this.slug = slugify(this.discountName, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// findOneAndUpdate middleware to handle slug update
discountSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.discountName) {
    update.slug = slugify(update.discountName, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
    this.setUpdate(update);
  }

  next();
});

// 🔹 Ensure slug is unique
discountSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({ slug: this.slug });
  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(409, `${this.discountName} already exists`);
  }
  next();
});

module.exports =
  mongoose.models.Discount || mongoose.model("Discount", discountSchema);
