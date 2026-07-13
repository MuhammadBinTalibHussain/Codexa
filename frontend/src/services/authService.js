import apiClient from "./apiClient";

const authService = {
  register: (username, email, password) =>
    apiClient.post("/auth/register", { username, email, password }).then((r) => r.data),
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }).then((r) => r.data),
  logout: () => apiClient.post("/auth/logout").then((r) => r.data),
  getMe: () => apiClient.get("/auth/me").then((r) => r.data),
};

export default authService;