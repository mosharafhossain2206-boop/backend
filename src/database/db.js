const chalk = require("chalk");
const mongoose = require("mongoose");
require("dotenv").config();
exports.connectDatabase = async () => {
  try {
    const dbinfo = await mongoose.connect(
      `${process.env.MONGODB_URL}/mern2404`
    );
    console.log(
      chalk.bgCyanBright(
        `Database connection Sucesfull ${dbinfo.connection.host}`
      )
    );
  } catch (error) {
    console.log("Database Connection Failed !!", error);
  }
};
