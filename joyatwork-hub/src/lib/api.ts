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

// SERVICES EXPORTÉS
export const authApi = {
  login: (credentials: any) => api.post("/login", credentials),
};

export const adoptionChurnApi = {
  getAll: async () => {
    try {
      const res = await api.get("/admin/churn-risk");
      return res.data || []; // Retourne un tableau vide au minimum
    } catch (e) { return []; }
  },
};

export const diagnosticApi = {
  getGlobalStats: () => api.get("/diagnostics/global-stats").then(res => res.data || {}),
  getUserHealth: () => api.get("/diagnostics/user-health").then(res => res.data || []),
  getCompanyHealth: () => api.get("/diagnostics/company-health").then(res => res.data || []),
};

export const challengesApi = {
  getAll: () => api.get("/challenges").then(res => res.data || []),
};

export const usersApi = {
  getAll: () => api.get("/users").then(res => res.data || []),
};

export default api;