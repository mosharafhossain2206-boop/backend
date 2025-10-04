const Joi = require("joi");
const { customError } = require("../helpers/customError");

const orderValidationSchema = Joi.object({
  user: Joi.string().optional().allow(null, "").messages({
    "string.base": "User must be a valid ObjectId string",
  }),

  guestId: Joi.string().optional().allow(null, "").messages({
    "string.base": "GuestId must be a string",
  }),

  shippingInfo: Joi.object({
    fullName: Joi.string().trim().optional().messages({
      "string.base": "Full name must be a string",
    }),
    phone: Joi.string().trim().required().messages({
      "string.base": "Phone must be a string",
      "any.required": "Phone number is required",
    }),
    address: Joi.string().trim().optional().allow("", null).messages({
      "string.base": "Address must be a string",
    }),
    email: Joi.string().email().optional().allow("", null).messages({
      "string.email": "Email must be a valid email address",
    }),
  })
    .required()
    .messages({
      "object.base": "Shipping info must be an object",
      "any.required": "Shipping info is required",
    }),

  deliveryCharge: Joi.string().required().messages({
    "string.base": "Delivery charge must be a valid ObjectId string",
    "any.required": "Delivery charge is required",
  }),

  paymentMethod: Joi.string().valid("cod", "sslcommerz").required().messages({
    "any.only": "Payment method must be either 'cod' or 'sslcommerz'",
    "any.required": "Payment method is required",
  }),
}).unknown(true);

exports.validateOrder = async (req) => {
  try {
    const value = await orderValidationSchema.validateAsync(req.body);
    return value;
  } catch (error) {
    console.log(error.details);
    throw new customError(
      401,
      error.details.map((item) => item.message).join(", ")
    );
  }
};
