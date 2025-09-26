const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {},
    slug: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// create slug from name
brandSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
      locale: "en",
      trim: true,
    });
  }
  next();
});

// check if slug already exists
brandSchema.pre("save", async function (next) {
  const isExist = await this.constructor.findOne({
    slug: this.slug,
});

  if (isExist && !isExist._id.equals(this._id)) {
    throw new customError(401, `${this.name} Already exists, try another one`);
  }
  next();
});

module.exports = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
