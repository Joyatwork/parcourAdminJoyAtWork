import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Types pour TypeScript
export interface Company {
  id: number;
  name: string;
  sector: string;
  employees_count: number;
  email: string;
  phone: string;
  website?: string;
  status: 'Active' | 'Inactive';
  description?: string;
  verified: boolean;
  active_contracts: number;
  created_at: string;
  updated_at: string;
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
  status: 'Actif' | 'Brouillon' | 'Terminé';
  created_at: string;
  updated_at: string;
}

// Services API
export const companiesApi = {
  getAll: () => api.get<Company[]>('/companies'),
  getById: (id: number) => api.get<Company>(`/companies/${id}`),
  create: (data: Partial<Company>) => api.post<Company>('/companies', data),
  update: (id: number, data: Partial<Company>) => api.put<Company>(`/companies/${id}`, data),
  delete: (id: number) => api.delete(`/companies/${id}`),
};

export const practitionersApi = {
  getAll: async () => {
    try {
      console.log('Appel API vers:', `${API_BASE_URL}/practitioners-real.php`);
      const response = await fetch(`${API_BASE_URL}/practitioners-real.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données reçues:', data);
      return { data };
    } catch (error) {
      console.error('Erreur dans practitionersApi.getAll:', error);
      throw error;
    }
  },
  create: async (data: Partial<Practitioner>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/add_practitioner.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error('Erreur dans practitionersApi.create:', error);
      throw error;
    }
  },
  update: (id: number, data: Partial<Practitioner>) => api.put<Practitioner>(`/update_practitioner.php?id=${id}`, data),
  delete: (id: number) => api.delete(`/delete_practitioner.php?id=${id}`),
};

// Fonction helper pour créer un praticien
export const createPractitioner = async (data: Partial<Practitioner>): Promise<Practitioner> => {
  const response = await practitionersApi.create(data);
  return response.data;
};

export const challengesApi = {
  getAll: () => api.get<Challenge[]>('/challenges'),
  getById: (id: number) => api.get<Challenge>(`/challenges/${id}`),
  create: (data: Partial<Challenge>) => api.post<Challenge>('/challenges', data),
  update: (id: number, data: Partial<Challenge>) => api.put<Challenge>(`/challenges/${id}`, data),
  delete: (id: number) => api.delete(`/challenges/${id}`),
};

// Intercepteur pour la gestion des erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
