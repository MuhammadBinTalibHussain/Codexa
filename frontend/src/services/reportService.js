import apiClient from "./apiClient";

const reportService = {
  getForSnippet: (snippetId) => apiClient.get(`/reports/snippet/${snippetId}`).then((r) => r.data),
  generate: (snippetId) => apiClient.post(`/reports/generate/${snippetId}`).then((r) => r.data),
  remove: (id) => apiClient.delete(`/reports/${id}`).then((r) => r.data),
};

export default reportService;