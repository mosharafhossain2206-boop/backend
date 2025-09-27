const { connectDatabase } = require("./src/database/db");
const { server } = require("./src/app");
require("dotenv").config();
const chalk = require("chalk");

connectDatabase()
  .then(() => {
    server.listen(process.env.PORT || 4000, () => {
      console.log(
        chalk.bgGreen(`Server running on http://localhost:${process.env.PORT}`)
      );
    });
  })
  .catch((error) => {
    console.log(chalk.bgRed("Database Connection Failed !!", error));
  });
