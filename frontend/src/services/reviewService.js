import apiClient from "./apiClient";

const reviewService = {
  getForSnippet: (snippetId) =>
    apiClient.get(`/reviews/snippet/${snippetId}`).then((r) => r.data),

  create: (payload) => apiClient.post("/reviews", payload).then((r) => r.data),

  update: (id, payload) => apiClient.put(`/reviews/${id}`, payload).then((r) => r.data),

  remove: (id) => apiClient.delete(`/reviews/${id}`).then((r) => r.data),

  markHelpful: (id) => apiClient.post(`/reviews/${id}/helpful`).then((r) => r.data),

  markUnhelpful: (id) => apiClient.post(`/reviews/${id}/unhelpful`).then((r) => r.data),
};

export default reviewService;
