let io = null;
const { Server } = require("socket.io");
const { customError } = require("../helpers/customError");

// socket server

module.exports = {
  initSocket: (hostServer) => {
    io = new Server(hostServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });
    // connect socket
    io.on("connection", (socket) => {
      console.log("Client server connect");
      const userId = socket.handshake.query.userId;
      if (userId) {
        socket.join(userId);
      }
    });

    io.on("disconnect", () => {
      console.log("Client server disconnect");
    });
  },
  getIo: () => {
    console.log("get io called" + io);
    if (!io) throw new customError("Socket.io not initialized!");
    return io;
  },
};
