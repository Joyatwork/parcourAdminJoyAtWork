import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";

// Practitioner interface
export interface Practitioner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  specialty?: string;
  location?: string;
}

// Wallet
export interface Wallet {
  id: number;
  entreprise_id: number;
  balance: number;
  devise: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  type: "credit" | "debit";
  amount: number;
  reference_type: string | null;
  reference_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Orders
export interface OrderLine {
  id: number;
  order_id: number;
  type_service: string;
  quantite: number;
  prix_unitaire_ht: number;
  montant_ligne_ht: number;
  part_joyatwork_pct: number;
  part_praticien_pct: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  entreprise_id: number;
  numero_commande: string;
  montant_total_ht: number;
  montant_total_ttc: number;
  statut: string;
  date_commande: string;
  created_at: string;
  updated_at: string;
  lines?: OrderLine[];
}

// Credits
export interface Credit {
  id: number;
  entreprise_id: number;
  order_line_id: number | null;
  type_service: string;
  quantite_initiale: number;
  quantite_restante: number;
  date_expiration: string | null;
  created_at: string;
  updated_at: string;
}

// Usages
export interface Usage {
  id: number;
  entreprise_id: number;
  employee_id: number | null;
  practitioner_id: number | null;
  order_line_id: number | null;
  credit_id: number | null;
  type_service: string;
  date_prestation: string | null;
  prix_ht: number;
  part_joyatwork_ht: number;
  part_praticien_ht: number;
  statut: string;
  validated_at: string | null;
  created_at: string;
  updated_at: string;
}

// Invoices
export interface Invoice {
  id: number;
  entreprise_id: number;
  type: "recharge" | "order";
  reference_type: string | null;
  reference_id: number | null;
  numero_facture: string;
  montant_ht: number;
  montant_ttc: number;
  taux_tva: number;
  statut: "a_emettre" | "envoyee" | "payee";
  date_emission: string | null;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// Payouts
export interface PayoutLine {
  id: number;
  payout_id: number;
  usage_id: number;
  montant_ht: number;
}

export interface Payout {
  id: number;
  practitioner_id: number | null;
  periode_debut: string | null;
  periode_fin: string | null;
  montant_total_ht: number;
  nombre_usages: number;
  statut: "calcule" | "paye";
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  lines?: PayoutLine[];
}

// Wallet hooks
export function useWalletByEntreprise(entrepriseId?: number) {
  return useQuery<Wallet>({
    queryKey: ["wallet-by-entreprise", entrepriseId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/wallets/find-by-entreprise?entreprise_id=${entrepriseId}`
      );
      if (!response.ok) throw new Error("Erreur lors du chargement du wallet");
      return response.json();
    },
    enabled: !!entrepriseId,
  });
}

export function useWallet(walletId?: number) {
  return useQuery<Wallet>({
    queryKey: ["wallet", walletId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}`);
      if (!response.ok) throw new Error("Erreur lors du chargement du wallet");
      return response.json();
    },
    enabled: !!walletId,
  });
}

export function useWalletStats(walletId?: number) {
  return useQuery<{
    balance: number;
    devise: string;
    total_credit: number;
    total_debit: number;
    credits_restants: number;
  }>({
    queryKey: ["wallet-stats", walletId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}/stats`);
      if (!response.ok) throw new Error("Erreur lors du chargement des stats wallet");
      return response.json();
    },
    enabled: !!walletId,
  });
}

export function useWalletTransactions(walletId?: number) {
  return useQuery<{ data: WalletTransaction[] }>({
    queryKey: ["wallet-transactions", walletId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/wallets/${walletId}/transactions`
      );
      if (!response.ok)
        throw new Error("Erreur lors du chargement des transactions wallet");
      return response.json();
    },
    enabled: !!walletId,
  });
}

// Orders hooks
export function useOrders(filters?: { entreprise_id?: number; statut?: string }) {
  const params = new URLSearchParams();
  if (filters?.entreprise_id) params.append("entreprise_id", String(filters.entreprise_id));
  if (filters?.statut) params.append("statut", filters.statut);
  const url = `${API_BASE_URL}/orders?${params.toString()}`;

  return useQuery<{ data: Order[] }>({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des commandes");
      return response.json();
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  type OrderLineInput = {
    type_service: string;
    quantite: number;
    prix_unitaire_ht: number;
    part_joyatwork_pct: number;
    part_praticien_pct: number;
  };

  type CreateOrderInput = {
    entreprise_id: number;
    date_commande?: string;
    lignes: OrderLineInput[];
  };

  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors de la création de la commande");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-by-entreprise"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

// Credits hooks
export function useCredits(filters?: {
  entreprise_id?: number;
  type_service?: string;
  actifs?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.entreprise_id) params.append("entreprise_id", String(filters.entreprise_id));
  if (filters?.type_service) params.append("type_service", filters.type_service);
  if (filters?.actifs) params.append("actifs", "1");
  const url = `${API_BASE_URL}/credits?${params.toString()}`;

  return useQuery<{ data: Credit[] }>({
    queryKey: ["credits", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des crédits");
      return response.json();
    },
  });
}

// Usages hooks
export function useUsages(filters?: {
  entreprise_id?: number;
  practitioner_id?: number;
  statut?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.entreprise_id) params.append("entreprise_id", String(filters.entreprise_id));
  if (filters?.practitioner_id) params.append("practitioner_id", String(filters.practitioner_id));
  if (filters?.statut) params.append("statut", filters.statut);
  const url = `${API_BASE_URL}/usages?${params.toString()}`;

  return useQuery<{ data: Usage[] }>({
    queryKey: ["usages", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des usages");
      return response.json();
    },
  });
}

export function useCreateUsage() {
  const queryClient = useQueryClient();

  type CreateUsageInput = {
    entreprise_id: number;
    practitioner_id?: number;
    employee_id?: number;
    type_service: string;
    date_prestation: string;
    prix_ht: number;
    part_joyatwork_pct?: number;
    part_praticien_pct?: number;
    order_line_id?: number;
  };

  return useMutation<Usage, Error, CreateUsageInput>({
    mutationFn: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/usages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors de la création de l'usage");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usages"] });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
    },
  });
}

// Invoices hooks
export function useInvoices(filters?: {
  entreprise_id?: number;
  type?: string;
  statut?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.entreprise_id) params.append("entreprise_id", String(filters.entreprise_id));
  if (filters?.type) params.append("type", filters.type);
  if (filters?.statut) params.append("statut", filters.statut);
  const url = `${API_BASE_URL}/invoices?${params.toString()}`;

  return useQuery<{ data: Invoice[] }>({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des factures");
      return response.json();
    },
  });
}

export function useCreateRechargeInvoice() {
  const queryClient = useQueryClient();

  type CreateRechargeInput = {
    entreprise_id: number;
    montant_ht: number;
    taux_tva?: number;
    due_date?: string;
  };

  return useMutation<Invoice, Error, CreateRechargeInput>({
    mutationFn: async (payload) => {
      const response = await fetch(`${API_BASE_URL}/invoices/recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors de la création de la facture de recharge");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, Error, number>({
    mutationFn: async (invoiceId) => {
      const response = await fetch(
        `${API_BASE_URL}/invoices/${invoiceId}/mark-paid`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Erreur lors du passage en payé");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// Payouts hooks
export function usePayouts(filters?: {
  practitioner_id?: number;
  statut?: string;
  periode_debut?: string;
  periode_fin?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.practitioner_id)
    params.append("practitioner_id", String(filters.practitioner_id));
  if (filters?.statut) params.append("statut", filters.statut);
  if (filters?.periode_debut) params.append("periode_debut", filters.periode_debut);
  if (filters?.periode_fin) params.append("periode_fin", filters.periode_fin);
  const url = `${API_BASE_URL}/payouts?${params.toString()}`;

  return useQuery<{ data: Payout[] }>({
    queryKey: ["payouts", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des reversements");
      return response.json();
    },
  });
}

export function useGeneratePayout() {
  const queryClient = useQueryClient();

  type GeneratePayoutInput = {
    practitioner_id: number;
    periode_debut: string;
    periode_fin: string;
  };

  return useMutation({
    mutationFn: async (payload: GeneratePayoutInput) => {
      const response = await fetch(`${API_BASE_URL}/payouts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors de la génération du reversement");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
  });
}

export function useMarkPayoutPaid() {
  const queryClient = useQueryClient();

  return useMutation<Payout, Error, number>({
    mutationFn: async (payoutId) => {
      const response = await fetch(
        `${API_BASE_URL}/payouts/${payoutId}/mark-paid`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Erreur lors du marquage payé");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
  });
}

// Practitioners hook (for billing)
export function usePractitioners(search?: string) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  const url = `${API_BASE_URL}/practitioners?${params.toString()}`;

  return useQuery<{ success: boolean; data: Practitioner[] }>({
    queryKey: ["practitioners", search],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur lors du chargement des praticiens");
      return response.json();
    },
  });
}

// Génération factures mensuelles (contrats)
export function useGenerateMonthlyInvoices() {
  const queryClient = useQueryClient();

  type GenerateMonthlyInput = {
    year: number;
    month: number;
  };

  return useMutation({
    mutationFn: async (payload: GenerateMonthlyInput) => {
      const response = await fetch(`${API_BASE_URL}/billing/generate-monthly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erreur lors de la génération des factures mensuelles");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

