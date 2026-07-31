import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const TYPING_STOP_DELAY_MS = 2000;

const useLiveComments = (snippetId, currentUsername, token) => {
  const [comments, setComments] = useState([]);
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!snippetId || !token) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-snippet", snippetId);
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("new-comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    socket.on("typing-indicator", ({ username, isTyping }) => {
      if (username === currentUsername) return;
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        }
        return prev.filter((u) => u !== username);
      });
    });

    socket.on("users-in-room", (users) => setActiveUsers(users));

    return () => {
      socket.emit("leave-snippet", snippetId);
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [snippetId, token, currentUsername]);

  const sendComment = useCallback(
    (text) => {
      if (!text.trim() || !socketRef.current) return;
      socketRef.current.emit("send-comment", { snippetId, text: text.trim() });
    },
    [snippetId]
  );

  // Called on every keystroke in the comment box. Emits "typing" once, then
  // auto-emits "stopped typing" after a short pause so the indicator doesn't
  // stick around forever if the user just walks away mid-sentence.
  const notifyTyping = useCallback(() => {
    if (!socketRef.current || !snippetId) return;
    socketRef.current.emit("user-typing", { snippetId, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("user-typing", { snippetId, isTyping: false });
    }, TYPING_STOP_DELAY_MS);
  }, [snippetId]);

  return { comments, connected, sendComment, typingUsers, activeUsers, notifyTyping };
};

export default useLiveComments;
