import axios from "axios";

/**
 * ===============================
 * API BASE URL
 * ===============================
 */
const rawApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

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
});

/**
 * ===============================
 * TYPES
 * ===============================
 */

export interface Company {
  id: number;
  name: string;
  sector?: string;
  location?: string;
  employees?: number;
  status?: string;
  is_active?: boolean;
  contract_value?: number;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
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

/**
 * ===============================
 * COMPANIES API
 * ===============================
 */
export const companiesApi = {
  getAll: () => api.get<Company[]>("/companies"),
  getById: (id: number) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post("/companies", data),
  update: (id: number, data: Partial<Company>) =>
    api.put(`/companies/${id}`, data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};

/**
 * ===============================
 * PRACTITIONERS API
 * ===============================
 */
export const practitionersApi = {
  getAll: () => api.get<Practitioner[]>("/practitioners"),
  getById: (id: number) => api.get<Practitioner>(`/practitioners/${id}`),
  create: (data: Partial<Practitioner>) =>
    api.post<Practitioner>("/practitioners", data),
};

export const createPractitioner = (data: Partial<Practitioner>) =>
  api.post("/practitioners", data);

/**
 * ===============================
 * CHALLENGES API
 * ===============================
 */
export const challengesApi = {
  getAll: () => api.get<Challenge[]>("/challenges"),
  getById: (id: number) => api.get<Challenge>(`/challenges/${id}`),
  create: (data: Partial<Challenge>) => api.post("/challenges", data),
  update: (id: number, data: Partial<Challenge>) =>
    api.put(`/challenges/${id}`, data),
  delete: (id: number) => api.delete(`/challenges/${id}`),
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
