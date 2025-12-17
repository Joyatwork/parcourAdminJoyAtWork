import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Représentation d'une entreprise basée sur la table SQL existante `entreprise`
 * Colonnes supposées : id, name, domain, is_active, created_at, updated_at
 */
export interface Company {
  id: number;
  name: string;
  domain?: string | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyStats {
  total_companies: number;
  active_contracts: number;
  total_employees: number;
  total_revenue: number;
  average_rating: number;
  sectors: Record<string, number>;
}

const API_BASE_URL = "http://localhost:8001/api";

// Hook pour récupérer toutes les entreprises
export function useCompanies(filters?: {
  sector?: string;
  status?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.sector && filters.sector !== "Tous les secteurs") {
    queryParams.append("sector", filters.sector);
  }
  if (filters?.status && filters.status !== "Tous les statuts") {
    queryParams.append("status", filters.status);
  }
  if (filters?.search) {
    queryParams.append("search", filters.search);
  }

  const url = `${API_BASE_URL}/companies?${queryParams.toString()}`;

  return useQuery<Company[]>({
    queryKey: ["companies", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des entreprises");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer une entreprise spécifique
export function useCompany(id: number) {
  return useQuery<Company>({
    queryKey: ["company", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement de l'entreprise");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook pour récupérer les statistiques des entreprises
export function useCompanyStats() {
  return useQuery<CompanyStats>({
    queryKey: ["company-stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/companies-stats`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des statistiques");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour créer une nouvelle entreprise
export function useCreateCompany() {
  const queryClient = useQueryClient();

  // Données attendues par l'API pour la table `entreprises`
  type CreateCompanyInput = {
    name: string;
    domain?: string | null;
    is_active?: boolean | null;
  };

  return useMutation<Company, Error, CreateCompanyInput>({
    mutationFn: async (newCompany) => {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCompany),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'entreprise");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache des entreprises pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
    },
  });
}

// Hook pour mettre à jour une entreprise
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  // Données attendues par l'API pour la table `entreprises`
  // Tous les champs sont optionnels car on peut mettre à jour partiellement
  type UpdateCompanyInput = {
    name?: string;
    domain?: string | null;
    is_active?: boolean | null;
  };

  return useMutation<Company, Error, { id: number; data: UpdateCompanyInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'entreprise");
      }

      return response.json();
    },
    onSuccess: (updatedCompany) => {
      // Mettre à jour le cache
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({
        queryKey: ["company", updatedCompany.id],
      });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
    },
  });
}

// Hook pour supprimer une entreprise
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'entreprise");
      }
    },
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
    },
  });
}
