const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const productModel = require("../models/product.model");
const variantModel = require("../models/variant.model");
const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");
const { validateVariant } = require("../validation/varinat.validation");

// create variant
exports.createVariant = asyncHandler(async (req, res) => {
  const data = await validateVariant(req);

  // Upload Cloudinary images in parallel
  const imageUrl = await Promise.all(
    data.image.map((img) => uploadCloudinaryFile(img.path))
  );

  //   save the data  into varinat model
  const variant = await variantModel.create({ ...data, image: imageUrl });
  if (!variant) throw new customError(500, "Varinat not created !!!");
  //   now push the variant id into product model

  const checkUpdateProduct = await productModel.findOneAndUpdate(
    { _id: data.product },
    { $push: { variant: variant._id } },
    { new: true }
  );
  if (!checkUpdateProduct)
    throw new customError(500, "Varinat not pushed into product !!!");

  apiResponse.sendSucess(res, 201, "variant Created sucessfully", variant);
});

// get all variant
exports.getAllVariants = asyncHandler(async (_, res) => {
  const variants = await variantModel
    .find()
    .populate("product")
    .sort({ createdAt: -1 }); // newest first

  if (!variants || variants?.length === 0) {
    throw new customError(404, "No variants found");
  }

  apiResponse.sendSucess(
    res,
    200,
    "All variants fetched successfully",
    variants
  );
});

// single variant
// get single variant by slug
exports.getSingleVariant = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const variant = await variantModel.findOne({ slug }).populate("product");
  if (!variant) {
    throw new customError(404, `Variant with slug '${slug}' not found`);
  }

  apiResponse.sendSucess(res, 200, "Variant fetched successfully", variant);
});

// update image
exports.uploadVariantImage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { image } = req.files;
  console.log(
    "%csrccontroller\varinat.controller.js:72 image",
    "color: #007acc;",
    image
  );
  const variant = await variantModel.findOne({ slug });
  if (!variant) {
    throw new customError(404, `Variant with slug '${slug}' not found`);
  }

  // Upload Cloudinary images in parallel
  const imageUrl = await Promise.all(
    image.map((img) => uploadCloudinaryFile(img.path))
  );
  //   now merge the image into database
  variant.image = [...variant.image, ...imageUrl];
  await variant.save();

  apiResponse.sendSucess(res, 200, "Variant fetched successfully", variant);
});

// update varinat information
// update variant
exports.updateVariantinfo = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const data = req.body;

  // find the existing variant
  const existingVariant = await variantModel.findOne({ slug });
  if (!existingVariant) {
    throw new customError(404, "Variant not found");
  }

  // check if product is changed
  const productChanged =
    data.product &&
    data.product.toString() !== existingVariant.product.toString();

  // update variant
  const updatedVariant = await variantModel.findOneAndUpdate(
    { slug },
    { ...data },
    { new: true }
  );

  if (!updatedVariant) {
    throw new customError(500, "Variant not updated !!!");
  }

  // if product changed, remove from old product and add to new one
  if (productChanged) {
    // remove from old product
    await productModel.findByIdAndUpdate(existingVariant.product, {
      $pull: { variant: existingVariant._id },
    });

    // add to new product
    await productModel.findByIdAndUpdate(updatedVariant.product, {
      $push: { variant: updatedVariant._id },
    });
  }

  apiResponse.sendSucess(
    res,
    200,
    "Variant updated successfully",
    updatedVariant
  );
});
