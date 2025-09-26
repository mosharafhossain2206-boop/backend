const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const categoryModel = require("../models/category.model");
const { validateCategory } = require("../validation/category.validation");
const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");

exports.createCategory = asyncHandler(async (req, res) => {
  const value = await validateCategory(req);
  // upload image into cloudinary
  const imagesAsset = await uploadCloudinaryFile(value.image.path);
  // save into database
  const category = await categoryModel.create({
    name: value.name,
    image: imagesAsset,
  });
  if (!category) throw new customError(500, "category Not created");
  apiResponse.sendSucess(res, 201, "category created sucesssfully", category);
});

// get all category
exports.getAllCategory = asyncHandler(async (req, res) => {
  const allCategory = await categoryModel.aggregate([
    {
      $lookup: {
        from: "subcategories", // collection to join
        localField: "subCategory", // field in categories
        foreignField: "_id", // field in subcategories
        as: "subCategory", // output array field
      },
    },
    {
      $project: {
        name: 1,
        image: 1,
        isActive: 1,
        createdAt: 1,
        slug: 1,
        subCategory: 1,
      },
    },
  ]);

  if (!allCategory) throw new customError(401, "category not Found!!");
  apiResponse.sendSucess(res, 200, "get all category sucessfull", allCategory);
});

// get single category
exports.singleCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const category = await categoryModel
    .findOne({ slug })
    .select("-_id -updatedAt -__v");
  if (!category) throw new customError(401, "category not Found !");
  apiResponse.sendSucess(
    res,
    200,
    "single category found sucesfully",
    category
  );
});

//update category
exports.updateCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const category = await categoryModel.findOne({ slug });
  if (!category) throw new customError(401, "category not Found !");
  if (req.body.name) {
    category.name = req.body.name;
  }
  if (req?.files?.image?.length) {
    // delete previous cloudinary image
    const response = await deleteClodinaryFile(category.image.publicId);
    console.log(response);
    // upload new update image
    const uploadAsset = await uploadCloudinaryFile(req?.files?.image[0].path);
    category.image = uploadAsset;
  }

  await category.save();
  apiResponse.sendSucess(res, 200, "category update sucessfully", category);
});

// delete
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const category = await categoryModel.findOneAndDelete({ slug });
  if (!category) throw new customError(401, "category not Found !");
  // delete previous cloudinary image
  await deleteClodinaryFile(category.image.publicId);
  apiResponse.sendSucess(res, 200, "category delete sucesfully", category);
});

exports.activeCategory = asyncHandler(async (req, res) => {
  const { active } = req.query;
  if (!active) throw new customError(401, "active not Found !");
  const category = await categoryModel.find({ isActive: active });
  if (!category) throw new customError(401, "category not Found !");
  apiResponse.sendSucess(res, 200, "category get sucesfully", category);
});
