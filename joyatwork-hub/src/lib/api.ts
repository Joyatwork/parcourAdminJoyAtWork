import axios from "axios";

/**
 * ===============================
 * API BASE URL (ENV prioritaire)
 * ===============================
 */
const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://parcouradminjoyatwork-production.up.railway.app/api";

export const API_BASE_URL = String(rawApiBaseUrl).replace(/\/+$/, "");

/**
 * ===============================
 * AXIOS INSTANCE
 * ===============================
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // ✅ OBLIGATOIRE avec Sanctum
});

/**
 * ===============================
 * ✅ REQUEST INTERCEPTOR
 * Injecte automatiquement le token
 * ===============================
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * ===============================
 * TYPES
 * ===============================
 */

export interface CompanyUsage {
  company: number | string;
  company_name: string;
  total_employees: number;
  active_users: number;
  adoption_rate: number;
  risk_level: string;
  satisfaction_score?: number;
}

export interface Practitioner {
  id?: number | string;
  first_name: string;
  last_name: string;
  phone?: string;
  email: string;
  experience_years: number;
  rating: string | number;
  certifications?: string;
  availability?: string;
  bio?: string;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  category: string;
  points: number;
  duration: string;
  participants: number;
  completion_rate: number;
  status: "Actif" | "Brouillon" | "Terminé";
  created_at: string;
  updated_at: string;
}

export interface UserAccount {
  id: number;
  entreprise_id?: number | null;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: number | boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  role?: "admin" | "practitioner" | "enterprise" | "employee" | null;
}

export interface CreateAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
}

/**
 * ===============================
 * SERVICES API
 * ===============================
 */

export const adoptionChurnApi = {
  getAll: async (): Promise<CompanyUsage[]> => {
    const response = await api.get("/admin/churn-risk");
    const json = response.data;
    const raw = Array.isArray(json) ? json : json.data ?? [];

    return raw.map((c: any) => ({
      company: c.company ?? c.company_name ?? "Inconnu",
      company_name: c.company ?? c.company_name ?? "Inconnu",
      total_employees: c.total_employees ?? 0,
      active_users: c.active_users ?? 0,
      adoption_rate: c.usage_rate ?? 0,
      risk_level: c.churn_risk ?? "Low",
      satisfaction_score: c.satisfaction ?? 0,
    }));
  },
};

export const challengesApi = {
  getAll: () => api.get<Challenge[]>("/challenges"),
  getById: (id: number) => api.get<Challenge>(`/challenges/${id}`),
  create: (data: Partial<Challenge>) => api.post("/challenges", data),
  update: (id: number, data: Partial<Challenge>) =>
    api.put(`/challenges/${id}`, data),
  delete: (id: number) => api.delete(`/challenges/${id}`),
};

export const usersApi = {
  getAll: () => api.get<UserAccount[]>("/users"),
  createAdmin: (data: CreateAdminPayload) =>
    api.post("/users/admin", data),
  update: (id: number, data: Partial<UserAccount>) =>
    api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

/**
 * ===============================
 * RESPONSE INTERCEPTOR (LOG ERREURS)
 * ===============================
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default api;