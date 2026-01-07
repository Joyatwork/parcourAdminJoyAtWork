import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Représentation d'un contrat basée sur la table SQL `contrats`
 */
export interface Contract {
  id: number;
  entreprise_id: number;
  numero_contrat: string;
  type_contrat: "Standard" | "Premium" | "Enterprise";
  statut:
    | "En négociation"
    | "En attente signature"
    | "Actif"
    | "Expiré"
    | "Résilié";
  date_debut: string;
  date_fin: string | null;
  date_signature: string | null;
  date_renouvellement: string | null;
  montant_annuel: number;
  montant_mensuel: number | null;
  devise: string;
  description: string | null;
  conditions_particulieres: string | null;
  nombre_employes_couverts: number | null;
  created_at: string;
  updated_at: string;
  entreprise?: {
    id: number;
    name: string;
  };
}

export interface ContractStats {
  total_contrats: number;
  contrats_actifs: number;
  contrats_en_negociation: number;
  contrats_expires: number;
  chiffre_affaires_annuel: number;
  contrats_par_type: Record<string, number>;
}

const API_BASE_URL = "http://localhost:8001/api";

// Hook pour récupérer tous les contrats
export function useContracts(filters?: {
  entreprise_id?: number;
  statut?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();

  if (filters?.entreprise_id) {
    queryParams.append("entreprise_id", filters.entreprise_id.toString());
  }
  if (filters?.statut && filters.statut) {
    queryParams.append("statut", filters.statut);
  }
  if (filters?.search) {
    queryParams.append("search", filters.search);
  }

  const url = `${API_BASE_URL}/contracts?${queryParams.toString()}`;

  return useQuery<Contract[]>({
    queryKey: ["contracts", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des contrats");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook pour récupérer un contrat spécifique
export function useContract(id: number) {
  return useQuery<Contract>({
    queryKey: ["contract", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du contrat");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook pour récupérer les statistiques des contrats
export function useContractStats() {
  return useQuery<ContractStats>({
    queryKey: ["contract-stats"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/contracts-stats`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des statistiques");
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour créer un nouveau contrat
export function useCreateContract() {
  const queryClient = useQueryClient();

  // Données attendues par l'API pour la table `contrats`
  type CreateContractInput = {
    entreprise_id: number;
    type_contrat?: "Standard" | "Premium" | "Enterprise";
    statut?:
      | "En négociation"
      | "En attente signature"
      | "Actif"
      | "Expiré"
      | "Résilié";
    date_debut: string;
    date_fin?: string | null;
    date_signature?: string | null;
    date_renouvellement?: string | null;
    montant_annuel: number;
    montant_mensuel?: number | null;
    devise?: string;
    description?: string | null;
    conditions_particulieres?: string | null;
    nombre_employes_couverts?: number | null;
  };

  return useMutation<Contract, Error, CreateContractInput>({
    mutationFn: async (newContract) => {
      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContract),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du contrat");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache des contrats pour recharger la liste
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract-stats"] });
    },
  });
}

// Hook pour mettre à jour un contrat
export function useUpdateContract() {
  const queryClient = useQueryClient();

  // Données attendues par l'API pour la table `contrats`
  // Tous les champs sont optionnels car on peut mettre à jour partiellement
  type UpdateContractInput = {
    type_contrat?: "Standard" | "Premium" | "Enterprise";
    statut?:
      | "En négociation"
      | "En attente signature"
      | "Actif"
      | "Expiré"
      | "Résilié";
    date_debut?: string;
    date_fin?: string | null;
    date_signature?: string | null;
    date_renouvellement?: string | null;
    montant_annuel?: number;
    montant_mensuel?: number | null;
    devise?: string;
    description?: string | null;
    conditions_particulieres?: string | null;
    nombre_employes_couverts?: number | null;
  };

  return useMutation<
    Contract,
    Error,
    { id: number; data: UpdateContractInput }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du contrat");
      }

      return response.json();
    },
    onSuccess: (updatedContract) => {
      // Mettre à jour le cache
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({
        queryKey: ["contract", updatedContract.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contract-stats"] });
    },
  });
}

// Hook pour supprimer un contrat
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du contrat");
      }
    },
    onSuccess: () => {
      // Invalider le cache
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({ queryKey: ["contract-stats"] });
    },
  });
}








