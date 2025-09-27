const { io } = require("socket.io-client");
const socket = io("http://localhost:3000");

// connection successful
socket.on("connect", () => {
  console.log(" Connected to server with id:");
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

// error
socket.on("connect_error", (err) => {
  console.error("⚠️ Connection error:", err.message);
});
