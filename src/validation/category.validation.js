const Joi = require("joi");
const { customError } = require("../helpers/customError");

const categoryValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(5).max(20).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "any.required": "Name is required",
      "string.min": "Name must be at least 5 characters long",
      "string.max": "Name must not exceed 20 characters",
      "string.trim": "Name must not contain leading or trailing spaces",
    }),
  },
  { abortEarly: true }
).unknown(true);

// validate category information
exports.validateCategory = async (req) => {
  try {
    const value = await categoryValidationSchema.validateAsync(req.body);
    //    sanitize image
    const image = req?.files?.image[0];
    const allowFomat = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    if (image?.length > 1) {
      throw new customError(401, "Image must be Single");
    }
    if (image?.size > 5 * 1024 * 1024) {
      throw new customError(401, "Image size  upload below 2MB");
    }
    if (!allowFomat.includes(image?.mimetype)) {
      throw new customError(
        401,
        "Image fromat not Accecpted try image/*jpg png"
      );
    }
    return {name: value.name , image: req?.files?.image[0]};
  } catch (error) {
    if (error.data == null) {
      throw new customError(401, error);
    } else {
      console.log(
        "error",
        error?.details?.map((item) => item.message)
      );
      throw new customError(
        401,
        `${error.details.map((item) => item.message)})`
      );
    }
  }
};
