const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Snippet = require("./models/Snippet");
const notify = require("./utils/notify");

// Tracks who is currently active in each snippet room, since Socket.IO
// doesn't give us this for free. Shape: Map<roomName, Map<socketId, { userId, username }>>
const roomUsers = new Map();

const getRoomUserList = (room) => {
  const users = roomUsers.get(room);
  return users ? Array.from(users.values()) : [];
};

const initSocket = (httpServer, allowedOrigins) => {
  // Falls back to allowing any origin only if the caller didn't pass
  // restricted origins (keeps local/manual testing simple).
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : "*" },
  });

  // Require a valid JWT before a socket connection is accepted at all,
  // per "Socket connections require a valid JWT for authentication before
  // room access."
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Not authorized, no token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("username email role");

      if (!user) {
        return next(new Error("Not authorized, user no longer exists"));
      }

      socket.user = { id: user._id.toString(), username: user.username };
      next();
    } catch (err) {
      next(new Error("Not authorized, token failed or expired"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-snippet", (snippetId) => {
      if (!snippetId) return;
      const room = `snippet:${snippetId}`;
      socket.join(room);
      socket.data.room = room;

      if (!roomUsers.has(room)) roomUsers.set(room, new Map());
      roomUsers.get(room).set(socket.id, { userId: socket.user.id, username: socket.user.username });

      // Tell the room a user joined, and send everyone (including the
      // joiner) the current active user list.
      socket.to(room).emit("user-joined", { username: socket.user.username });
      io.to(room).emit("users-in-room", getRoomUserList(room));
    });

    socket.on("leave-snippet", (snippetId) => {
      if (!snippetId) return;
      const room = `snippet:${snippetId}`;
      leaveRoom(socket, room);
    });

    socket.on("user-typing", ({ snippetId, isTyping }) => {
      if (!snippetId || !socket.user) return;
      const room = `snippet:${snippetId}`;
      socket.to(room).emit("typing-indicator", {
        username: socket.user.username,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on("send-comment", async ({ snippetId, text }) => {
      if (!snippetId || !text || !socket.user) return;
      const room = `snippet:${snippetId}`;
      const comment = {
        author: socket.user.username,
        text: text.toString().trim(),
        createdAt: new Date().toISOString(),
      };
      if (!comment.text) return;

      io.to(room).emit("new-comment", comment);
      // Stop showing a stale "is typing" bubble once the message lands.
      socket.to(room).emit("typing-indicator", { username: socket.user.username, isTyping: false });

      // Notify the snippet's author (unless they're commenting on their own
      // snippet) that a new comment came in.
      try {
        const snippet = await Snippet.findById(snippetId).select("author title");
        if (snippet) {
          await notify({
            recipientId: snippet.author,
            actorId: socket.user.id,
            type: "comment",
            message: `${socket.user.username} commented on your snippet "${snippet.title}"`,
            link: `/snippets/${snippetId}`,
          });
        }
      } catch (err) {
        console.error("Failed to create comment notification:", err.message);
      }
    });

    socket.on("disconnect", () => {
      const room = socket.data.room;
      if (room) leaveRoom(socket, room);
    });
  });

  function leaveRoom(socket, room) {
    socket.leave(room);
    const users = roomUsers.get(room);
    if (users) {
      users.delete(socket.id);
      if (users.size === 0) {
        roomUsers.delete(room);
      } else {
        roomUsers.set(room, users);
      }
    }
    if (socket.user) {
      socket.to(room).emit("user-left", { username: socket.user.username });
    }
    io.to(room).emit("users-in-room", getRoomUserList(room));
    if (socket.data.room === room) socket.data.room = null;
  }

  return io;
};

module.exports = initSocket;
