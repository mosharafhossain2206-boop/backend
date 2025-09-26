const Joi = require("joi");
const { customError } = require("../helpers/customError");

// Variant validation schema
const variantValidationSchema = Joi.object({
  variantName: Joi.string().trim().min(3).max(100).required().messages({
    "string.base": "Variant name must be a string",
    "string.empty": "Variant name is required",
    "any.required": "Variant name is required",
    "string.min": "Variant name must be at least 3 characters long",
    "string.max": "Variant name must not exceed 100 characters",
  }),

  sku: Joi.string().trim().required().messages({
    "string.base": "SKU must be a string",
    "string.empty": "SKU is required",
    "any.required": "SKU is required",
  }),

  size: Joi.string().required().messages({
    "string.base": "Size must be a string",
    "string.empty": "Size is required",
    "any.required": "Size is required",
  }),

  color: Joi.string().required().messages({
    "string.base": "Color must be a string",
    "string.empty": "Color is required",
    "any.required": "Color is required",
  }),

  stockVariant: Joi.number().min(0).required().messages({
    "number.base": "Stock variant must be a number",
    "number.min": "Stock variant cannot be negative",
    "any.required": "Stock variant is required",
  }),

  purchasePrice: Joi.number().min(100).required().messages({
    "number.base": "Purchase price must be a number",
    "number.min": "Purchase price must be at least 100",
    "any.required": "Purchase price is required",
  }),

  retailPrice: Joi.number().required().messages({
    "number.base": "Retail price must be a number",
    "any.required": "Retail price is required",
  }),

  wholeSalePrice: Joi.number().required().messages({
    "number.base": "Wholesale price must be a number",
    "any.required": "Wholesale price is required",
  }),

  image: Joi.array()
    .items(
      Joi.object({
        path: Joi.string().uri().required(),
        size: Joi.number()
          .max(5 * 1024 * 1024)
          .required()
          .messages({
            "number.base": "Image size must be a number",
            "number.max": "Image size cannot exceed 5MB",
          }),
      })
    )
    .max(5)
    .messages({
      "array.max": "Maximum of 5 images allowed",
    }),
}).unknown(true);

// Validate variant information
exports.validateVariant = async (req) => {
  try {
    // Validate the variant fields first
    const value = await variantValidationSchema.validateAsync(req.body);

    // Sanitize image (if uploaded)
    const images = req?.files?.image;
    if (images && images.length > 0) {
      const allowedFormats = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      // Check if the uploaded image is within allowed formats and size
      images.forEach((img) => {
        if (!allowedFormats.includes(img.mimetype)) {
          throw new customError(
            401,
            "Image format not accepted. Try jpg, jpeg, png, or webp"
          );
        }
        if (img.size > 5 * 1024 * 1024) {
          throw new customError(401, "Image size must be below 5MB");
        }
      });
    }

    return {
      ...value,
      image: images || [],
    };
  } catch (error) {
    if (!error.details) {
      throw new customError(401, error);
    } else {
      throw new customError(
        401,
        error.details.map((item) => item.message).join(", ")
      );
    }
  }
};
