const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const subCategoryModel = require("../models/subCategory.model");
const categoryModel = require("../models/category.model");
const { validateSubCategory } = require("../validation/subcategory.validation");
// create subCategory
exports.createSubCategory = asyncHandler(async (req, res) => {
  const value = await validateSubCategory(req);

  // save subcategory info
  const subcategory = await subCategoryModel.create(value);
  if (!subcategory) throw new customError(500, "Failed to create sub c");
  // update category database
  await categoryModel.findOneAndUpdate(
    { _id: value.category },
    { $push: { subCategory: subcategory._id } },
    { new: true }
  );

  apiResponse.sendSucess(res, 201, "sc created sucessfully", subcategory);
});

// get all subcategory
exports.getAllSubCategory = asyncHandler(async (req, res) => {
  const allSubCategory = await subCategoryModel.find();
  if (!allSubCategory) throw new customError(401, "allSubCategory not Found!!");
  apiResponse.sendSucess(
    res,
    200,
    "get all allSubCategory sucessfull",
    allSubCategory
  );
});

// get single category
exports.singleSubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const subcategory = await subCategoryModel.findOne({ slug });
  if (!subcategory) throw new customError(401, "subcategory not Found !");
  apiResponse.sendSucess(
    res,
    200,
    "single subcategory found sucesfully",
    subcategory
  );
});

// get single category
exports.updatesubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const subcategory = await subCategoryModel.findOne({ slug });
  subcategory.name = req.body.name || subcategory.name;
  if (req.body.category) {
    // find the category and remove subcategory from arra

    await categoryModel.findOneAndUpdate(
      {
        _id: subcategory.category,
      },
      {
        $pull: { subCategory: subcategory._id },
      },
      {
        new: true,
      }
    );

    // push the subcategory into new category
    await categoryModel.findOneAndUpdate(
      {
        _id: req.body.category,
      },
      {
        $push: { subCategory: subcategory._id },
      },
      {
        new: true,
      }
    );
    subcategory.category = req.body.category || subcategory.category;
  }

  await subcategory.save();
  apiResponse.sendSucess(
    res,
    200,
    " subcategory updated sucesfully",
    subcategory
  );
});

// delte

exports.deletesubCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(401, "Slug not Found !");
  const subcategory = await subCategoryModel.findOne({ slug });
  // find the category and remove subcategory from arra
  await categoryModel.findOneAndUpdate(
    {
      _id: subcategory.category,
    },
    {
      $pull: { subCategory: subcategory._id },
    },
    {
      new: true,
    }
  );
  await subCategoryModel.deleteOne({ _id: subcategory._id });
  apiResponse.sendSucess(
    res,
    200,
    " subcategory updated sucesfully",
    subcategory
  );
});
