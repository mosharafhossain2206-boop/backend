const Joi = require("joi");
const { customError } = require("../helpers/customError");

const brandValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(3).max(30).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "any.required": "Name is required",
      "string.min": "Name must be at least 3 characters long",
      "string.max": "Name must not exceed 30 characters",
      "string.trim": "Name must not contain leading or trailing spaces",
    }),
  },
  { abortEarly: true }
).unknown(true);

// validate brand information
exports.validateBrand = async (req) => {
  try {
    const value = await brandValidationSchema.validateAsync(req.body);

    // sanitize image
    const image = req?.files?.image?.[0];
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (req?.files?.image?.length > 1) {
      throw new customError(401, "Image must be single");
    }
    if (image?.size > 2 * 1024 * 1024) {
      throw new customError(401, "Image size must be below 2MB");
    }
    if (image && !allowFormat.includes(image?.mimetype)) {
      throw new customError(
        401,
        "Image format not accepted. Try jpg, jpeg, png, or webp"
      );
    }

    return {
      name: value.name,
      image: image || null,
    };
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
