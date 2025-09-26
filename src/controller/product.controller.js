const { asyncHandler } = require("../utils/asyncHandler");
const { apiResponse } = require("../utils/apiResponse");
const { customError } = require("../helpers/customError");
const { validateProduct } = require("../validation/product.validation");
const {
  uploadCloudinaryFile,
  deleteClodinaryFile,
} = require("../helpers/cloudinary");
const productModel = require("../models/product.model");
const { generateQrCode, generateBarCode } = require("../helpers/QrCode");

// create a new product
exports.createProduct = asyncHandler(async (req, res) => {
  // validate product information
  const data = await validateProduct(req);
  const allImageInfo = [];
  //   upload images into cloudinary
  for (const image of data.image) {
    const imageInfo = await uploadCloudinaryFile(image.path);
    allImageInfo.push(imageInfo);
  }
  //   now save product into database
  const product = await productModel.create({
    ...data,
    image: allImageInfo,
  });
  if (!product) throw new customError(400, "Failed to create product");
  //   create a qr code for the product
  const link = `${process.env.FRONTEND_URL}/product/${product.slug}`;
  const barCodeText = data.qrCode
    ? data.qrCode
    : `${product.sku}-${product.name.slice(0, 3)}-${new Date().getFullYear()}`;
  const qrcode = await generateQrCode(link);
  const barcode = await generateBarCode(barCodeText);
  //   now update product with qr code and bar code
  product.qrCode = qrcode;
  product.barCode = barcode;
  product.barCode = barcode;
  if (!data.retailPrice && !data.wholeSalePrice && !data.color) {
    product.variantType = "multiple";
  } else {
    product.variantType = "single";
  }
  await product.save();

  // bar code
  apiResponse.sendSucess(res, 201, "Product created successfully", product);
});

// get all product
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { sort_by } = req.query;
  let sortQuery = {};
  if (sort_by == "created-descending") {
    sortQuery = { createdAt: -1 };
  } else if (sort_by == "created-ascending") {
    sortQuery = { createdAt: 1 };
  } else if (sort_by == "title-ascending") {
    sortQuery = { name: 1 };
  } else {
    sortQuery = { name: -1 };
  }

  const products = await productModel
    .find()
    .sort(sortQuery)
    .populate({
      path: "category",
      select: "-subCategory -createdAt -updatedAt -__v",
    })
    .populate({ path: "subCategory" })
    .populate({ path: "brand" });
  if (!products) throw new customError(404, "No products found");
  apiResponse.sendSucess(res, 200, "Products fetched successfully", products);
});

// get a single product by slug
exports.getSingleProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "Product slug is required");
  const product = await productModel
    .findOne({ slug })
    .populate({
      path: "category",
      select: "-subCategory -createdAt -updatedAt -__v",
    })
    .populate({ path: "subCategory" })
    .populate({ path: "brand" });
  if (!product) throw new customError(404, "Product not found");
  apiResponse.sendSucess(res, 200, "Product fetched successfully", product);
});

// update a product info
exports.getUpdateProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "Product slug is required");
  const product = await productModel.findOneAndUpdate({ slug }, req.body, {
    new: true,
  });

  if (!product) throw new customError(404, "Product not found");
  apiResponse.sendSucess(res, 200, "Product fetched successfully", product);
});

// updaate product images
exports.UpdateProductimage = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new customError(400, "Product slug is required");
  const product = await productModel.findOne({ slug });
  if (!product) throw new customError(404, "Product not found");
  for (const imageid of req.body.imageid) {
    await deleteClodinaryFile(imageid);
    product.image = product.image.filter((img) => img.publicId !== imageid);
  }

  for (const image of req.files.image) {
    const imageInfo = await uploadCloudinaryFile(image.path);
    product.image.push(imageInfo);
  }
  await product.save();

  if (!product) throw new customError(404, "Product not found");
  apiResponse.sendSucess(res, 200, "Product fetched successfully", product);
});

// get product by category id subCategoryid and brand id
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, subCategory, brand, tag } = req.query;
  let query;
  if (category) {
    query = { ...query, category: category };
  }
  if (brand) {
    if (Array.isArray(brand)) {
      query = { ...query, brand: { $in: brand } };
    } else {
      query = { ...query, brand: brand };
    }
  }
  if (subCategory) {
    query = { ...query, subCategory: subCategory };
  }
  if (tag) {
    console.log(tag);
    if (Array.isArray(tag)) {
      query = { ...query, tag: { $in: tag } };
    } else {
      query = { ...query, tag: tag };
    }
  }

  const products = await productModel.find(query);
  if (!products) throw new customError(404, "No products found");
  apiResponse.sendSucess(res, 200, "Products fetched successfully", products);
});

//get product by price filter
exports.priceFilterProducts = asyncHandler(async (req, res) => {
  const { minPrice, maxPrice } = req.query;
  if (!minPrice || !maxPrice)
    throw new customError(400, "Min and max price are required");
  const products = await productModel.find({
    $and: [{ retailPrice: { $gte: minPrice, $lte: maxPrice } }],
  });

  if (!products) throw new customError(404, "No products found");
  apiResponse.sendSucess(res, 200, "Products fetched successfully", products);
});

// product paginattion

exports.productspagination = asyncHandler(async (req, res) => {
  const { page, item } = req.query;
  let skipamount = (page - 1) * item;
  const totalitems = await productModel.countDocuments();
  const tatalPage = Math.ceil(totalitems / item);
  const products = await productModel
    .find()
    .skip(skipamount)
    .limit(item)
    .populate({
      path: "category",
      select: "-subCategory -createdAt -updatedAt -__v",
    })
    .populate({ path: "subCategory" })
    .populate({ path: "brand" });
  if (!products) throw new customError(404, "No products found");
  apiResponse.sendSucess(res, 200, "Products fetched successfully", {
    products,
    totalitems,
    tatalPage,
  });
});
