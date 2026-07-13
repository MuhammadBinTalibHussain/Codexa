const { Server } = require("socket.io");

const initSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join-snippet", (snippetId) => socket.join(`snippet:${snippetId}`));
    socket.on("leave-snippet", (snippetId) => socket.leave(`snippet:${snippetId}`));
    socket.on("send-comment", ({ snippetId, author, text, createdAt }) => {
      if (!snippetId || !text) return;
      io.to(`snippet:${snippetId}`).emit("new-comment", { author, text, createdAt });
    });
  });

  return io;
};

module.exports = initSocket;