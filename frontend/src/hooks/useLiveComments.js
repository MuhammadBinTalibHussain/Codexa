import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const useLiveComments = (snippetId, currentUsername) => {
  const [comments, setComments] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!snippetId) return undefined;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-snippet", snippetId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("new-comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socket.emit("leave-snippet", snippetId);
      socket.disconnect();
    };
  }, [snippetId]);

  const sendComment = useCallback(
    (text) => {
      if (!text.trim() || !socketRef.current) return;
      socketRef.current.emit("send-comment", {
        snippetId,
        author: currentUsername || "Anonymous",
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });
    },
    [snippetId, currentUsername]
  );

  return { comments, connected, sendComment };
};

export default useLiveComments;