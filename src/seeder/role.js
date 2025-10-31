const chalk = require("chalk");
const mongoose = require("mongoose");
require("dotenv").config();
const roleModel = require("../models/role.model");
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
    await seedRole();
  } catch (error) {
    console.log("Database Connection Failed !!", error);
  }
};

// seed role
const seedRole = async () => {
  try {
    const roles = [
      { name: "admin" },
      { name: "manager" },
      { name: "salesman" },
      { name: "owner" },
      { name: "user" },
    ];

    // insert roles into db
    const roleInstances = await Promise.all(
      roles.map((role) => roleModel.create(role))
    );

    if (!roleInstances.length)
      throw new customError(501, "Roles not inserted into DB");

    console.log("✅ Role insertion done");
  } catch (error) {
    throw new customError(401, error.message || error);
  }
};

connectDatabase();
