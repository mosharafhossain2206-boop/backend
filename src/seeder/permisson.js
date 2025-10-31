const chalk = require("chalk");
const mongoose = require("mongoose");
require("dotenv").config();
const permissionModel = require("../models/permission.model");
const { customError } = require("../helpers/customError");
const connectDatabase = async () => {
  try {
    const dbinfo = await mongoose.connect(
      `${process.env.MONGODB_URL}/mern2404`
    );
    console.log(
      chalk.bgCyanBright(
        `Database connection Sucesfull ${dbinfo.connection.host}`
      )
    );
    await seedPermission();
  } catch (error) {
    console.log("Database Connection Failed !!", error);
  }
};

// seed role
const seedPermission = async () => {
  try {
    const roles = [
      { name: "brand" },
      { name: "cart" },
      { name: "category" },
      { name: "coupon" },
      { name: "deliveryCharge" },
      { name: "discount" },
      { name: "invoice" },
      { name: "order" },
      { name: "permission" },
      { name: "product" },
      { name: "varinat" },
      { name: "user" },
      { name: "role" },
      { name: "subcategory" },
    ];

 

    // insert roles into db
    const roleInstances = await Promise.all(
      roles.map((p) => permissionModel.create(p))
    );

    if (!roleInstances.length)
      throw new customError(501, "permission not inserted into DB");

    console.log("✅ permission insertion done");
  } catch (error) {
    throw new customError(401, error.message || error);
  }
};

connectDatabase();
