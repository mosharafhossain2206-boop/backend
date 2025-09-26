const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const productModel = require("../models/product.model");
const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");
const { validateReview } = require("../validation/customerReview.validation");

// create review
exports.createReview = asyncHandler(async (req, res) => {
  const data = await validateReview(req);

  //   upload image into  cloudinary
  const imageUrl = await Promise.all(
    data.image.map((img) => uploadCloudinaryFile(img.path))
  );
  //   now save the review into database
  const sumbitReview = await productModel.findByIdAndUpdate(
    { _id: data.productId },
    {
      $push: { reviews: { ...data, image: imageUrl } },
    },
    {
      new: true,
    }
  );
  if (!sumbitReview) throw new customError(500, "review created failed");
  apiResponse.sendSucess(res, 201, "review done", sumbitReview);
});
