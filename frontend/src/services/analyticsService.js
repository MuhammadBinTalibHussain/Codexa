import apiClient from "./apiClient";

const analyticsService = {
  getAdmin: () => apiClient.get("/analytics/admin").then((r) => r.data),
};

export default analyticsService;
