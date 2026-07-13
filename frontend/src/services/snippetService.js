import apiClient from "./apiClient";

const snippetService = {
  getAll: () => apiClient.get("/snippets").then((r) => r.data),
  getById: (id) => apiClient.get(`/snippets/${id}`).then((r) => r.data),
  getByUser: (userId) => apiClient.get(`/snippets/user/${userId}`).then((r) => r.data),
  create: (payload) => apiClient.post("/snippets", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/snippets/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/snippets/${id}`).then((r) => r.data),
};

export default snippetService;