const chalk = require("chalk");
const { io } = require("socket.io-client");
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  query: { userId: "123" },
});

// connection successful
socket.on("connect", () => {
  console.log(" Connected to server with id:");
});

// addtocart event listher form client  side
socket.on("cart", (data) => {
  console.log(chalk.bgBlueBright(data));
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

// error
socket.on("connect_error", (err) => {
  console.error("⚠️ Connection error:", err.message);
});
