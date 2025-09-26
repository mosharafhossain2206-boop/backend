const Joi = require("joi");
const { customError } = require("../helpers/customError");

// Joi validation schema for review
const reviewValidationSchema = Joi.object(
  {
    reviewerid: Joi.string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.base": "Reviewer ID must be a string",
        "string.empty": "Reviewer ID is required",
        "any.required": "Reviewer ID is required",
        "string.pattern.base": "Reviewer ID must be a valid MongoDB ObjectId",
      }),
    productId: Joi.string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "string.base": "productId ID must be a string",
        "string.empty": "productId ID is required",
        "any.required": "productId ID is required",
        "string.pattern.base": "productId ID must be a valid MongoDB ObjectId",
      }),

    comment: Joi.string().trim().max(500).messages({
      "string.base": "Comment must be a string",
      "string.max": "Comment must not exceed 500 characters",
    }),

    rating: Joi.number().min(0).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 0",
      "number.max": "Rating must not exceed 5",
      "any.required": "Rating is required",
    }),
  },
  { abortEarly: true }
).unknown(true);

// Validate review function
exports.validateReview = async (req) => {
  try {
    const value = await reviewValidationSchema.validateAsync(req.body);

    // sanitize images
    const images = req?.files?.image || [];
    const allowFormat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

    if (images.length > 3) {
      throw new customError(401, "You can upload a maximum of 3 images");
    }

    images.forEach((img) => {
      if (img.size > 2 * 1024 * 1024) {
        throw new customError(401, "Each image must be below 2MB");
      }
      if (!allowFormat.includes(img.mimetype)) {
        throw new customError(
          401,
          "Image format not accepted. Try jpg, jpeg, png, or webp"
        );
      }
    });

    return {
      reviewerid: value.reviewerid,
      productId: value.productId,
      comment: value.comment || "",
      rating: value.rating,
      image: images.length > 0 ? images : [],
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
