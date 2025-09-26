const express = require("express");
const _ = express.Router();
const productController = require("../../controller/product.controller");
const { upload } = require("../../middleware/multer.middleware");

_.route("/create-product").post(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.createProduct
);
_.route("/all-products").get(productController.getAllProducts);
_.route("/single-product/:slug").get(productController.getSingleProduct);
_.route("/update-product/:slug").put(productController.getUpdateProduct);
_.route("/update-product-image/:slug").put(
  upload.fields([{ name: "image", maxCount: 10 }]),
  productController.UpdateProductimage
);
_.route("/search-product").get(productController.getProducts);
_.route("/price-filter").get(productController.priceFilterProducts);
_.route("/product-pagination").get(productController.productspagination);
module.exports = _;
