const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const bannerModel = require("../models/banner.model");

const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");
const { validateBanner } = require("../validation/banner.validation");

// create banner
exports.createBanner = asyncHandler(async (req, res) => {
  const value = await validateBanner(req);

  // save into database
  const banner = await bannerModel.create({
    ...value,
    image: null,
  });
  if (!banner) throw new customError(500, "Banner Not created");
  apiResponse.sendSucess(res, 201, "Banner created sucesssfully", banner);
  // upload image into cloudinary
  (async () => {
    const imagesAsset = await uploadCloudinaryFile(value?.image?.path);
    if (!imagesAsset) throw new customError(500, "image not uploaded");
    await bannerModel.findOneAndUpdate(
      { _id: banner._id },
      { image: imagesAsset }
    );
  })();
});

// get banner
exports.getBanner = asyncHandler(async (req, res) => {
  const banner = await bannerModel.find();
  if (!banner) throw new customError(500, "Banner Not found");
  apiResponse.sendSucess(res, 200, "Banner found sucesssfully", banner);
});

// edit banner and when image  have then delete old image
exports.updateBanner = asyncHandler(async (req, res) => {
  const value = await validateBanner(req);
  const banner = await bannerModel.findById(req.params.bannerId);
  if (!banner) throw new customError(500, "Banner Not found");
  if (req?.files?.image) {
    // delete old image from cloudinary
    await deleteClodinaryFile(banner.image.publicId);
    // upload new update image
    const uploadAsset = await uploadCloudinaryFile(req?.files?.image[0].path);
    banner.image = uploadAsset;
  }
  //   update banner info
  banner.title = value.title || banner.title;
  banner.description = value.description || banner.description;
  banner.targetUrl = value.targetUrl || banner.targetUrl;
  banner.targetType = value.targetType || banner.targetType;
  await banner.save();
  apiResponse.sendSucess(res, 200, "Banner updated sucessfully", banner);
});

// delete banner then remove image also
exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await bannerModel.findById(req.params.bannerId);
  if (!banner) throw new customError(500, "Banner Not found");
  await deleteClodinaryFile(banner.image.publicId);
  const bannerDeleted = await bannerModel.findOneAndDelete({ _id: banner._id });
  if (!bannerDeleted) throw new customError(500, "Banner not deleted");
  apiResponse.sendSucess(res, 200, "Banner deleted sucessfully", banner);
});
