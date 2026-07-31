import apiClient from "./apiClient";

const notificationService = {
  getAll: () => apiClient.get("/notifications").then((r) => r.data),

  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () => apiClient.patch("/notifications/read-all").then((r) => r.data),

  remove: (id) => apiClient.delete(`/notifications/${id}`).then((r) => r.data),
};

export default notificationService;
