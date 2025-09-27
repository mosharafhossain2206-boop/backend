require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { globalErrorHanlder } = require("./helpers/globalErrorHandler");
const { initSocket } = require("./socket/server");
/**
 * all global middleware
 */

// make node server using express
const server = http.createServer(app);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("short"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// route
app.use("/api/v1", require("./routes/index.api"));

const io = initSocket(server);

// global error handleling middleware
app.use(globalErrorHanlder);

module.exports = { server, io };
