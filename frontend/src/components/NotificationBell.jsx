import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

const timeAgo = (dateString) => {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = ({ enabled }) => {
  const { notifications, unreadCount, markAllAsRead, removeNotification } = useNotifications(enabled);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    // Notifications are marked as read automatically when the panel is opened.
    if (next) markAllAsRead();
  };

  const handleItemClick = (notification) => {
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  if (!enabled) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100">
            Notifications
          </div>
          <div className="scroll-thin max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet.
              </p>
            )}
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start gap-2 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                  !n.read ? "bg-brand-50/60 dark:bg-brand-900/10" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleItemClick(n)}
                  className="flex-1 text-left"
                >
                  <p className="text-gray-700 dark:text-gray-300">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{timeAgo(n.createdAt)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => removeNotification(n._id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
