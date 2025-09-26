const Joi = require("joi");
const { customError } = require("../helpers/customError");

// product validation schema
const productValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(3).max(100).messages({
      "string.base": "Product name must be a string",
      "string.empty": "Product name is required",
      "any.required": "Product name is required",
      "string.min": "Product name must be at least 3 characters long",
      "string.max": "Product name must not exceed 100 characters",
    }),

    category: Joi.string().messages({
      "string.base": "Category ID must be a string",
      "string.empty": "Category is required",
      "any.required": "Category is required",
    }),

    sku: Joi.string().trim().messages({
      "string.base": "SKU must be a string",
      "string.empty": "SKU is required",
      "any.required": "SKU is required",
    }),

    purchasePrice: Joi.number().min(100).messages({
      "number.base": "Purchase price must be a number",
      "number.min": "Purchase price must be at least 100",
      "any.required": "Purchase price is required",
    }),

    retailPrice: Joi.number().messages({
      "number.base": "Retail price must be a number",
      "any.required": "Retail price is required",
    }),
  },
  { abortEarly: true }
).unknown(true);

// validate product information
exports.validateProduct = async (req) => {
  try {
    const value = await productValidationSchema.validateAsync(req.body);

    // sanitize image (if uploaded)
    const images = req?.files?.image;
    if (images && images.length > 0) {
      const allowFormat = [
        "image/jpg",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (images.length > 5) {
        throw new customError(401, "Maximum 5 images allowed");
      }

      images.forEach((img) => {
        if (img.size > 5 * 1024 * 1024) {
          throw new customError(401, "Image size must be below 5MB");
        }
        if (!allowFormat.includes(img.mimetype)) {
          throw new customError(
            401,
            "Image format not accepted. Try jpg, jpeg, png, webp"
          );
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
