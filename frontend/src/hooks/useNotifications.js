import { useState, useEffect, useCallback } from "react";
import notificationService from "../services/notificationService";

const POLL_INTERVAL_MS = 60000; // raised from 30s -> 60s to reduce background request volume

const useNotifications = (enabled) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setLoading(false);
      return undefined;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Marks everything as read locally (optimistic) and on the server —
  // called when the notification panel is opened.
  const markAllAsRead = useCallback(async () => {
    if (notifications.every((n) => n.read)) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Non-critical; next poll will resync state if this failed.
    }
  }, [notifications]);

  const removeNotification = useCallback(async (id) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await notificationService.remove(id);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, error, markAllAsRead, removeNotification, refetch: fetchNotifications };
};

export default useNotifications;
