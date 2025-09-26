const Joi = require("joi");
const { customError } = require("../helpers/customError");

const discountValidationSchema = Joi.object({
  discountValidFrom: Joi.date().required().messages({
    "date.base": "Discount start date must be a valid date",
    "any.required": "Discount start date is required",
  }),
  discountValidTo: Joi.date().required().messages({
    "date.base": "Discount end date must be a valid date",
    "any.required": "Discount end date is required",
  }),
  discountName: Joi.string().trim().required().messages({
    "string.base": "Discount name must be a string",
    "string.empty": "Discount name is required",
    "any.required": "Discount name is required",
    "string.trim": "Discount name must not contain leading or trailing spaces",
  }),
  discountType: Joi.string().valid("tk", "percentance").required().messages({
    "any.only": "Discount type must be either 'tk' or 'percentance'",
    "any.required": "Discount type is required",
  }),
  discountValueByAmount: Joi.number().min(0).default(0).messages({
    "number.base": "Discount amount must be a number",
    "number.min": "Discount amount cannot be negative",
  }),
  discountValueByPercentance: Joi.number().min(0).max(100).default(0).messages({
    "number.base": "Discount percentage must be a number",
    "number.min": "Discount percentage cannot be negative",
    "number.max": "Discount percentage cannot exceed 100",
  }),
  discountPlan: Joi.string()
    .valid("category", "subCategory", "product")
    .required()
    .messages({
      "any.only":
        "Discount plan must be one of 'category', 'subCategory', or 'product'",
      "any.required": "Discount plan is required",
    }),
  category: Joi.string().optional().allow(null, "").messages({
    "string.base": "Category must be a string (ObjectId)",
  }),
  subCategory: Joi.string().optional().allow(null, "").messages({
    "string.base": "SubCategory must be a string (ObjectId)",
  }),
  product: Joi.string().optional().allow(null, "").messages({
    "string.base": "Product must be a string (ObjectId)",
  }),
  isActive: Joi.boolean().optional(),
}).unknown(true);

exports.validateDiscount = async (req) => {
  try {
    const value = await discountValidationSchema.validateAsync(req.body);
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
