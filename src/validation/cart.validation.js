const Joi = require("joi");
const { customError } = require("../helpers/customError");

// Joi validation schema for cart
const cartValidationSchema = Joi.object(
  {
    user: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .allow(null, "")
      .messages({
        "string.pattern.base": "User ID must be a valid ObjectId",
      }),

    guestid: Joi.string().trim().optional().allow(null, ""),

    product: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .allow(null, "")
      .messages({
        "string.base": "Product ID must be a string",
        "string.pattern.base": "Product ID must be a valid ObjectId",
        "any.required": "Product ID is required",
      }),

    variant: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .allow(null, "")
      .messages({
        "string.pattern.base": "Variant ID must be a valid ObjectId or null",
      }),

    quantity: Joi.number().integer().min(1).required().messages({
      "number.base": "Quantity must be a number",
      "number.min": "Quantity must be at least 1",
      "any.required": "Quantity is required",
    }),

    size: Joi.string().trim().optional().allow(null, ""),

    color: Joi.string().trim().optional().allow(null, ""),

    coupon: Joi.string().trim().optional().allow(null, ""),
  },
  { abortEarly: true }
).unknown(true);

// Validation function
exports.validateCart = async (req) => {
  try {
    const value = await cartValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    if (!error.details) {
      throw new customError(401, error.message || error);
    } else {
      throw new customError(
        401,
        error.details.map((item) => item.message).join(", ")
      );
    }
  }
};
