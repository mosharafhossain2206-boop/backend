const Joi = require("joi");
const { customError } = require("../helpers/customError");

// Joi validation schema for SubCategory
const subCategoryValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(2).max(20).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "any.required": "Name is required",
      "string.min": "Name must be at least 5 characters long",
      "string.max": "Name must not exceed 20 characters",
      "string.trim": "Name must not contain leading or trailing spaces",
    }),
    category: Joi.string().required().messages({
      "string.base": "Category ID must be a string",
      "string.empty": "Category ID is required",
      "any.required": "Category ID is required",
    }),
   
  },
  { abortEarly: true }
).unknown(true);

/**
 * 🔹 Validate subCategory information
 */
exports.validateSubCategory = async (req) => {
  try {
    const value = await subCategoryValidationSchema.validateAsync(req.body);
    return value
  } catch (error) {
    console.log(
      "error",
      error.details.map((item) => item.message)
    );

    throw new customError(401, `${error.details.map((item) => item.message)}`);
  }
};
