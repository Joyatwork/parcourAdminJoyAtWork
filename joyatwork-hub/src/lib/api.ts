import axios from "axios";

const isProd = import.meta.env.PROD;

const API_BASE_URL = String(
  isProd
    ? "https://parcouradminjoyatwork-production.up.railway.app/api"
    : import.meta.env.VITE_API_URL || "http://localhost:8001/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ----------------------------
// AUTH TOKEN
// ----------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----------------------------
// GLOBAL ERROR HANDLING (IMPORTANT)
// ----------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API ERROR:", {
      url: error?.config?.url,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    return Promise.reject(error);
  }
);

// ----------------------------
// SAFE WRAPPER (ANTI PAGE BLANCHE)
// ----------------------------
const safeGet = async (url: string) => {
  try {
    const res = await api.get(url);
    return { data: res.data, error: null };
  } catch (err: any) {
    return {
      data: null,
      error: err?.response?.data || "API error",
    };
  }
};

// ----------------------------
// AUTH
// ----------------------------
export const authApi = {
  login: (credentials: any) => api.post("/login", credentials),
};

// ----------------------------
// USERS
// ----------------------------
export const usersApi = {
  getAll: () => safeGet("/users"),
};

// ----------------------------
// ADMIN ANALYTICS (CHURN + USAGE)
// ----------------------------
export const adminApi = {
  churnRisk: () => safeGet("/admin/churn-risk"),
  usageByCompany: () => safeGet("/admin/usage-by-company"),
};

// ----------------------------
// DIAGNOSTICS (TON PROBLÈME ICI)
// ----------------------------
export const diagnosticApi = {
  globalStats: () => safeGet("/diagnostics/global-stats"),
  userHealth: () => safeGet("/diagnostics/user-health"),
  companyHealth: () => safeGet("/diagnostics/company-health"),
};

// ----------------------------
// CHALLENGES
// ----------------------------
export const challengesApi = {
  getAll: () => safeGet("/challenges"),
  create: (data: any) => api.post("/challenges", data),
};

export default api;