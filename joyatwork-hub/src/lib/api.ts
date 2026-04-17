import axios from "axios";

/**
 * CONFIGURATION DE L'URL DE L'API
 */
const isProd = import.meta.env.PROD;

// On force l'URL Railway en prod, sinon on prend le .env ou localhost
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

// Intercepteur pour le Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * SERVICES
 */

export const authApi = {
    login: (credentials: any) => api.post("/login", credentials),
};

export const adoptionChurnApi = {
  // Correspond à Route::get('/admin/churn-risk')
  getAll: async () => {
    const response = await api.get("/admin/churn-risk");
    return response.data;
  },
  // Correspond à Route::get('/admin/usage-by-company')
  getUsage: () => api.get("/admin/usage-by-company"),
};

export const challengesApi = {
  getAll: () => api.get("/challenges"),
  getById: (id: number) => api.get(`/challenges/${id}`),
  create: (data: any) => api.post("/challenges", data),
};

export const usersApi = {
  getAll: () => api.get("/users"),
  createAdmin: (data: any) => api.post("/users/admin", data),
};

// Log des erreurs pour le debug
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Erreur API:", error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default api;