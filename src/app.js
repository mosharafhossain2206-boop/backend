require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const { globalErrorHanlder } = require("./helpers/globalErrorHandler");
/**
 * all global middleware
 */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("short"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// route
app.use("/api/v1", require("./routes/index.api"));

// global error handleling middleware
app.use(globalErrorHanlder);

module.exports = { app };
