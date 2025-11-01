const Joi = require("joi");
const { customError } = require("../helpers/customError");

const userValidationSchema = Joi.object(
  {
    name: Joi.string().trim().min(5).max(20).messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 5 characters long",
      "string.max": "Name must not exceed 20 characters",
      "string.trim": "Name must not contain leading or trailing spaces",
    }),
    email: Joi.string()
      .trim()
      .pattern(
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
      )
      .allow("", null)
      .messages({
        "string.email": "Your Email must be String",
        "string.pattern.base": "Your email not match or email is invalid",
        "string.trim": "Space not allowed",
      }),
    phone: Joi.string()
      .trim()
      .empty()
      .allow("", null)
      .pattern(/^(?:\+88|88)?01[3-9]\d{8}$/)
      .messages({
        "string.base": "Phone number must be a number",
        "string.empty": "Phone number is required",
        "string.pattern.base": "Invalid Bangladeshi phone number format",
        "string.trim": "Spaces are not allowed in phone number",
      }),
    password: Joi.string()
      .trim()
      .empty()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "string.pattern.base":
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit",
      }),
  },
  { abortEarly: true }
).unknown(true);

// validate user information
const validateUser = async (req) => {
  try {
    const value = await userValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log(
      "error",
      error.details.map((item) => item.message)
    );
    throw new customError(401, `${error.details.map((item) => item.message)})`);
  }
};

module.exports = { validateUser };
