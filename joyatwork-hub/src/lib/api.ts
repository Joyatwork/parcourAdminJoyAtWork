import axios from "axios";

const isProd = import.meta.env.PROD;
const rawApiBaseUrl = isProd
  ? "https://parcouradminjoyatwork-production.up.railway.app/api"
  : (import.meta.env.VITE_API_URL || "http://localhost:8001/api");

export const API_BASE_URL = String(rawApiBaseUrl).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SERVICES
export const authApi = {
    login: (credentials: any) => api.post("/login", credentials),
};

export const adoptionChurnApi = {
  getAll: async () => {
    const res = await api.get("/admin/churn-risk");
    return res.data;
  },
  getUsage: () => api.get("/admin/usage-by-company"),
};

export const diagnosticApi = {
  getGlobalStats: () => api.get("/diagnostics/global-stats"),
  getUserHealth: () => api.get("/diagnostics/user-health"),
  getCompanyHealth: () => api.get("/diagnostics/company-health"),
};

export const challengesApi = {
  getAll: () => api.get("/challenges"),
  create: (data: any) => api.post("/challenges", data),
};

export const usersApi = {
  getAll: () => api.get("/users"),
};

export default api;