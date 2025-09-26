const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const brandModel = require("../models/brand.model");
const { validateBrand } = require("../validation/brand.validation");
const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");

const NodeCache = require("node-cache");
const { json } = require("express");
const myCache = new NodeCache();

// create brand model
exports.createBrand = asyncHandler(async (req, res) => {
  const value = await validateBrand(req);
  //   upload image int cl
  const imageAsset = await uploadCloudinaryFile(value.image.path);
  console.log(imageAsset);

  // save the info into db
  const brand = new brandModel({
    name: value.name,
    image: imageAsset,
  });

  await brand.save();

  if (!brand) throw new customError(500, "Brand create Failed !!");
  apiResponse.sendSucess(res, 200, "brand create sucssfully", brand);
});

// get all brands
exports.getAllBrands = asyncHandler(async (req, res) => {
  const value = myCache.get("brands");
  if (value == undefined) {
    const brands = await brandModel.find().sort({ createdAt: -1 });
    myCache.set("brands", JSON.stringify(brands), 1000);
    if (!brands || brands.length === 0) {
      throw new customError(404, "No brands found");
    }
    apiResponse.sendSucess(res, 200, "Brands fetched successfully", brands);
  }
  apiResponse.sendSucess(
    res,
    200,
    "Brands fetched successfully",
    JSON.parse(value)
  );
});

// get single brand

exports.singlebrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const brand = await brandModel
    .findOne({ slug })
    .select("-_id -updatedAt -__v");
  if (!brand) throw new customError(401, "brand not Found !");
  apiResponse.sendSucess(res, 200, "single brand found sucesfully", brand);
});

// update brand
exports.updatebrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const brand = await brandModel.findOne({ slug });
  if (!brand) throw new customError(401, "brand not Found !");
  if (req?.files?.image) {
    // delete old image from cloudinary
    await deleteClodinaryFile(brand.image.publicId);
    // upload new update image
    const uploadAsset = await uploadCloudinaryFile(req?.files?.image[0].path);
    brand.image = uploadAsset;
  }
  //   update brand info
  brand.name = req?.body?.name || brand.name;
  await brand.save();
  apiResponse.sendSucess(res, 200, "brand updated sucessfully", brand);
});

// delete brand
exports.deletebrand = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const brand = await brandModel.findOne({ slug });
  if (!brand) throw new customError(401, "brand not Found !");
  await deleteClodinaryFile(brand.image.publicId);
  const brandDeleted = await brandModel.findOneAndDelete({ slug });
  if (!brandDeleted) throw new customError(500, "brand not deleted");
  apiResponse.sendSucess(res, 200, "brand deleted sucessfully", brand);
});
