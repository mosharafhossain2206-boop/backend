const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const { validateDiscount } = require("../validation/discount.validation");
const discountModel = require("../models/discount.model");
const categoryModel = require("../models/category.model");
const subCategoryModel = require("../models/subCategory.model");

// @desc Create a new discount
// @route POST /api/discounts
// @access Private/Admin
exports.createDiscount = asyncHandler(async (req, res) => {
  // Validate request body
  const validatedData = await validateDiscount(req);
  const disocunt = await discountModel.create(validatedData);
  if (!disocunt) {
    throw new customError(400, "Failed to create discount");
  }
  if (validatedData.discountPlan === "category" && validatedData.category) {
    await categoryModel.findByIdAndUpdate(validatedData.category, {
      discount: disocunt._id,
    });
  }

  // update subCategory discount
  if (
    validatedData.discountPlan === "subCategory" &&
    validatedData.subCategory
  ) {
    await subCategoryModel.findByIdAndUpdate(validatedData.subCategory, {
      discount: disocunt._id,
    });
  }
  apiResponse.sendSucess(res, 201, "Discount created successfully", disocunt);
});

// get all discounts
exports.getAllDiscounts = asyncHandler(async (req, res) => {
  const discounts = await discountModel.find().sort({ createdAt: -1 });
  apiResponse.sendSucess(res, 200, "Discounts fetched successfully", discounts);
});

// get single discount
exports.getSingleDiscount = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const discount = await discountModel
    .findOne({ slug: slug })
    .populate(["category", "subCategory"]);
  if (!discount) {
    throw new customError(404, "Discount not found");
  }
  apiResponse.sendSucess(res, 200, "Discount fetched successfully", discount);
});

// update discount

exports.updateDiscount = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const validatedData = await validateDiscount(req);
  const discount = await discountModel.findOne({ slug: slug });
  if (!discount) {
    throw new customError(404, "Discount not found");
  }

  //   update category field
  if (discount.discountPlan === "category" && discount.category) {
    await categoryModel.findByIdAndUpdate(discount.category, {
      discount: null,
    });
  }

  //   update subCategory field
  if (discount.discountPlan === "subCategory" && discount.subCategory) {
    await subCategoryModel.findByIdAndUpdate(discount.subCategory, {
      discount: null,
    });
  }

  //   now update with new category or subCategory
  if (validatedData.discountPlan === "category" && validatedData.category) {
    await categoryModel.findByIdAndUpdate(validatedData.category, {
      discount: discount._id,
    });
  }

  //   update subCategory discount
  if (
    validatedData.discountPlan === "subCategory" &&
    validatedData.subCategory
  ) {
    await subCategoryModel.findByIdAndUpdate(validatedData.subCategory, {
      discount: discount._id,
    });
  }

  //   finally update the whole discount document
  const updatedDiscount = await discountModel.findOneAndUpdate(
    { slug: slug },
    validatedData,
    {
      new: true,
    }
  );

  apiResponse.sendSucess(
    res,
    200,
    "Discount updated successfully",
    updatedDiscount
  );
});
