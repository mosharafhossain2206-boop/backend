const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const userModel = require("../models/user.model");
require("../models/role.model");
require("../models/permission.model");
const { validateUser } = require("../validation/user.validation");
const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");
// add user
exports.adduser = asyncHandler(async (req, res) => {
  const value = await validateUser(req);
  // Sanitize image (if uploaded)
  const images = req?.files?.image;
  if (images && images.length > 0) {
    const allowedFormats = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    // Check if the uploaded image is within allowed formats and size
    images.forEach((img) => {
      if (!allowedFormats.includes(img.mimetype)) {
        throw new customError(
          401,
          "Image format not accepted. Try jpg, jpeg, png, or webp"
        );
      }
      if (img.size > 5 * 1024 * 1024) {
        throw new customError(401, "Image size must be below 5MB");
      }
    });
  }

  //   upload cloudinar
  const imageObj = await uploadCloudinaryFile(images[0].path);
  //   now save data
  const userInstance = await userModel.create({
    ...value,
    image: imageObj,
  });
  if (!userInstance) {
    throw new customError(401, "User not created");
  }
  apiResponse.sendSucess(res, 200, "User created successfully", userInstance);
});

// get all user
exports.getAllUser = asyncHandler(async (req, res) => {
  const users = await userModel
    .find({ role: { $exists: true, $ne: [] } })
    .populate({
      path: "role",
    })
    .populate("permission.permissionId")
    .sort({ createdAt: -1 });
  if (!users || users.length === 0) {
    throw new customError(404, "No users found");
  }
  apiResponse.sendSucess(res, 200, "Users fetched successfully", users);
});

// assing user permission
exports.addPermissionToUser = asyncHandler(async (req, res) => {
  const { user, permissions } = req.body;

  const userInstance = await userModel.findOneAndUpdate(
    { _id: user },
    { permission: permissions },
    { new: true }
  );
  if (!userInstance) {
    throw new customError(404, "User not found");
  }
  apiResponse.sendSucess(res, 200, "User created successfully", userInstance);
});
