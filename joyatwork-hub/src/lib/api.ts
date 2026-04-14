import axios from "axios";

/**
 * ===============================
 * API BASE URL (ENV prioritaire)
 * ===============================
 */
const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8001/api";

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
  withCredentials: false, // CORS Laravel
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
  password_hash?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: number | boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  name?: string | null;
  email_verified_at?: string | null;
  password?: string | null;
  role?: "admin" | "practitioner" | "enterprise" | "employee" | null;
  remember_token?: string | null;
  birth_date?: string | null;
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  bio?: string | null;
  avatar?: string | null;
  preferences?: unknown;
  health_goals?: unknown;
  status?: "active" | "inactive" | "suspended" | null;
  last_login_at?: string | null;
  google_id?: string | null;
  provider?: string | null;
  avatar_url?: string | null;
  role_id?: number | null;
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
    try {
      const response = await api.get("/admin/churn-risk");
      const json = response.data;
      const raw = Array.isArray(json) ? json : json.data ?? [];

      return raw.map((c: any) => ({
        company: c.company ?? c.company_name ?? "Inconnu",
        company_name: c.company ?? c.company_name ?? "Inconnu",
        total_employees: c.total_employees ?? c.nombre_employes ?? 0,
        active_users: c.active_users ?? 0,
        adoption_rate: c.usage_rate ?? 0,
        risk_level: c.churn_risk ?? "Low",
        satisfaction_score: c.satisfaction ?? 0,
      }));
    } catch (error) {
      console.error("Erreur API churn-risk:", error);
      throw error;
    }
  },
};

export const challengesApi = {
  getAll: () => api.get<Challenge[]>("/challenges"),
  getById: (id: number) => api.get<Challenge>(`/challenges/${id}`),
  create: (data: Partial<Challenge>) => api.post<Challenge>("/challenges", data),
  update: (id: number, data: Partial<Challenge>) =>
    api.put<Challenge>(`/challenges/${id}`, data),
  delete: (id: number) => api.delete(`/challenges/${id}`),
};

export const usersApi = {
  getAll: () => api.get<UserAccount[]>("/users"),
  createAdmin: (data: CreateAdminPayload) =>
    api.post<UserAccount>("/users/admin", data),
  update: (id: number, data: Partial<UserAccount>) =>
    api.patch<UserAccount>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

/**
 * ===============================
 * AXIOS INTERCEPTOR
 * ===============================
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;