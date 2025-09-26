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

    guestid: Joi.string().trim().optional(),

    items: Joi.array()
      .items(
        Joi.object({
          product: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .allow(null, "")
            .messages({
              "string.pattern.base": "Product ID must be a valid ObjectId",
              "any.required": "Product is required",
            }),
          variant: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .optional()
            .allow(null, "")
            .messages({
              "string.pattern.base": "Variant ID must be a valid ObjectId",
            }),
          quantity: Joi.number().min(1).required().messages({
            "number.base": "Quantity must be a number",
            "number.min": "Quantity must be at least 1",
            "any.required": "Quantity is required",
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
        })
      )
      .required()
      .messages({
        "array.base": "Items must be an array",
        "array.min": "At least one item is required",
        "any.required": "Items are required",
      }),

    coupon: Joi.string().allow(null, "").messages({
      "string.pattern.base": "Coupon ID must be a valid ObjectId",
    }),
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
