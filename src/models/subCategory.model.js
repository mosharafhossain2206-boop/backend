const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/**
 * 🔹 Pre-save middleware
 * - Generate slug from name
 */
subCategorySchema.pre("save", async function (next) {
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

/**
 * 🔹 Pre-save middleware
 * - Ensure slug is unique
 */
subCategorySchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    slug: this.slug,
  });

  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, `${this.name} Already Exist, try another one`);
  }
  next();
});

/**
 * 🔹 Pre-find middlewares
 * - Auto-populate category & discount
 */
// function autoPopulate(next) {
//   this.populate({
//     path:"category"
//   })
//   next();
// }

// function autoSort(next) {
//   this.sort(
//    {createdAt : -1}
//   )
//   next();
// }

// subCategorySchema.pre("find", autoPopulate ,autoSort);
// subCategorySchema.pre("findOne", autoPopulate);
// subCategorySchema.pre("findOneAndUpdate", autoPopulate);

module.exports =
  mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);
