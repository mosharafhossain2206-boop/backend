const mongoose = require("mongoose");
const slugify = require("slugify");
const { customError } = require("../helpers/customError");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: Object,
    },
    targetUrl: {
      type: String,
      trim: true,
      default: "",
    },
    targetType: {
      type: String,

      default: "external",
    },
    slug: {
      type: String,
      trim: true,
    },
    priority: {
      type: Number,
      default: 0, // can be used for sorting banners
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null, // schedule banner display
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// auto-generate slug from title
bannerSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, {
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
bannerSchema.pre("save", async function (next) {
  const existing = await this.constructor.findOne({ slug: this.slug });
  if (existing && !existing._id.equals(this._id)) {
    throw new customError(401, `${this.title} already exists, try another one`);
  }
  next();
});

module.exports =
  mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
