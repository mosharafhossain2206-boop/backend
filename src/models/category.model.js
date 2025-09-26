const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {},
    slug: {
      type: String,
    },
    subCategory: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    discount: {
      type: mongoose.Types.ObjectId,
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

// make a slug using slugyfy

categorySchema.pre("save", async function (next) {
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

// check category  slug already exist or not
categorySchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    slug: this.slug,
  });

  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, `${this.name}  Already Exist try another One`);
  }
  next();
});

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
