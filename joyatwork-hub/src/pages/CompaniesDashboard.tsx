import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Globe,
  Plus,
  CheckCircle,
  Loader2,
  Trash2,
  Star,
  ChevronUp,
} from "lucide-react";
import {
  useCompanies,
  useCompanyStats,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/hooks/useCompanies";
import { useContracts } from "@/hooks/useContracts";
import { toast } from "@/components/ui/use-toast";

const COMPANY_API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8001/api";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getMinTimeForDate = (date: Date | null) => {
  if (!date) return "00:00";
  const now = new Date();
  if (!isSameDay(date, now)) return "00:00";
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Données de fallback en cas d'erreur API
const fallbackCompanies = [
  {
    id: 1,
    name: "TechCorp Solutions",
    sector: "Technologie",
    location: "Paris, France",
    employees: 250,
    phone: "+33142567890",
    email: "contact@techcorp.fr",
    website: "www.techcorp.fr",
    description: "Entreprise leader en solutions digitales innovantes",
    wellnessPrograms: ["Programme sport", "Télétravail", "Méditation"],
    status: "Actif",
    contractValue: "45000",
    verified: 1,
  },
  {
    id: 2,
    name: "BioHealth Industries",
    sector: "Santé",
    location: "Lyon, France",
    employees: 180,
    phone: "+33478123456",
    email: "rh@biohealth.fr",
    website: "www.biohealth.fr",
    description: "Spécialisée dans les biotechnologies médicales",
    wellnessPrograms: ["Checkup santé", "Nutrition", "Ergonomie"],
    status: "Actif",
    contractValue: "32000",
    verified: 1,
  },
  // ... autres entreprises de démonstration ...
];

// Helper function pour normaliser les données
const normalizeCompany = (company: any) => {
  // On part de la source brute pour ne pas perdre d'attributs
  const base = { ...company };

  const rawContractValue =
    base.contract_value !== undefined
      ? base.contract_value
      : base.contractValue;

  const parsedContractValue =
    typeof rawContractValue === "string"
      ? parseFloat(rawContractValue) || 0
      : rawContractValue ?? 0;

  const wellnessPrograms = Array.isArray(base.wellness_programs)
    ? base.wellness_programs
    : Array.isArray(base.wellnessPrograms)
      ? base.wellnessPrograms
      : [];

  return {
    ...base,
    sector: base.sector ?? "Secteur non défini",
    location: base.location ?? "Localisation non définie",
    employees: base.employees ?? 0,
    phone: base.phone ?? "",
    email: base.email ?? "",
    website: base.website ?? "",
    description: base.description ?? "",
    status:
      base.status ??
      (typeof base.is_active === "boolean"
        ? base.is_active
          ? "Actif"
          : "Inactif"
        : "En négociation"),
    verified: base.verified ?? false,
    wellness_programs: wellnessPrograms,
    contract_value: parsedContractValue,
  };
};

type CompanyStatus = "Actif" | "En négociation" | "Inactif";

const CompaniesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Tous les secteurs");
  const [statusFilter, setStatusFilter] = useState("Tous les statuts");
  const [contractTypeFilter, setContractTypeFilter] = useState("Tous les contrats");
  const [isScrollVisible, setIsScrollVisible] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // États pour la création - champs fondamentaux
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanySector, setNewCompanySector] = useState("");
  const [newCompanySectorCustom, setNewCompanySectorCustom] = useState("");
  const [newCompanyPaysCustom, setNewCompanyPaysCustom] = useState("");
  
  // États pour la création - informations complètes
  const [newCompanyAdresse, setNewCompanyAdresse] = useState("");
  const [newCompanyCodePostal, setNewCompanyCodePostal] = useState("");
  const [newCompanyVille, setNewCompanyVille] = useState("");
  const [newCompanyPays, setNewCompanyPays] = useState("");
  const [newCompanySiret, setNewCompanySiret] = useState("");
  const [newCompanyNumeroTva, setNewCompanyNumeroTva] = useState("");
  const [newCompanyFormeJuridique, setNewCompanyFormeJuridique] = useState("");
  const [newCompanyContactPrincipal, setNewCompanyContactPrincipal] = useState("");
  const [newCompanyEmailContact, setNewCompanyEmailContact] = useState("");
  const [newCompanyTelephoneContact, setNewCompanyTelephoneContact] = useState("");
  const [newCompanyNombreEmployes, setNewCompanyNombreEmployes] = useState("0");
  const [newCompanySiteWeb, setNewCompanySiteWeb] = useState("");
  const [newCompanyDescription, setNewCompanyDescription] = useState("");
  const [newCompanyDatePremierContact, setNewCompanyDatePremierContact] = useState("");
  const [newCompanySourceLead, setNewCompanySourceLead] = useState("");
  const [newCompanyDomain, setNewCompanyDomain] = useState("");
  const [newCompanyIsActive, setNewCompanyIsActive] = useState(true);

  // États pour l'édition d'entreprise
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  
  // États pour l'édition - champs fondamentaux
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyEmail, setEditCompanyEmail] = useState("");
  const [editCompanySector, setEditCompanySector] = useState("");
  const [editCompanySectorCustom, setEditCompanySectorCustom] = useState("");
  const [editCompanyPaysCustom, setEditCompanyPaysCustom] = useState("");
  
  // États pour l'édition - informations complètes
  const [editCompanyAdresse, setEditCompanyAdresse] = useState("");
  const [editCompanyCodePostal, setEditCompanyCodePostal] = useState("");
  const [editCompanyVille, setEditCompanyVille] = useState("");
  const [editCompanyPays, setEditCompanyPays] = useState("");
  const [editCompanySiret, setEditCompanySiret] = useState("");
  const [editCompanyNumeroTva, setEditCompanyNumeroTva] = useState("");
  const [editCompanyFormeJuridique, setEditCompanyFormeJuridique] = useState("");
  const [editCompanyContactPrincipal, setEditCompanyContactPrincipal] = useState("");
  const [editCompanyEmailContact, setEditCompanyEmailContact] = useState("");
  const [editCompanyTelephoneContact, setEditCompanyTelephoneContact] = useState("");
  const [editCompanyNombreEmployes, setEditCompanyNombreEmployes] = useState("0");
  const [editCompanySiteWeb, setEditCompanySiteWeb] = useState("");
  const [editCompanyDescription, setEditCompanyDescription] = useState("");
  const [editCompanyDatePremierContact, setEditCompanyDatePremierContact] = useState("");
  const [editCompanySourceLead, setEditCompanySourceLead] = useState("");
  const [editCompanyDomain, setEditCompanyDomain] = useState("");
  const [editCompanyIsActive, setEditCompanyIsActive] = useState(true);

  // États pour la suppression d'entreprise
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(
    null
  );
  const [deletingCompanyName, setDeletingCompanyName] = useState("");

  // États pour la planification RDV
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCompanyForRdv, setSelectedCompanyForRdv] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [rdvDetails, setRdvDetails] = useState("");
  const [isRdvListOpen, setIsRdvListOpen] = useState(false);
  const [rdvList, setRdvList] = useState<{ id: number; companyId: number; date: string; time: string; details: string }[]>([]);

  // État pour afficher les détails complets d'une entreprise
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState<any>(null);

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrollVisible(scrolled);
    };

    // Vérifier immédiatement au montage
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadCompanyAppointments = async () => {
      try {
        const response = await fetch(`${COMPANY_API_BASE_URL}/company-appointments`);
        if (!response.ok) {
          throw new Error("Erreur de récupération des RDV");
        }
        const data = await response.json();
        if (data?.success && Array.isArray(data.data)) {
          setRdvList(
            data.data
              .filter((item: any) => item && typeof item.id === "number")
              .map((item: any) => ({
                id: item.id,
                companyId: item.entreprise_id,
                date: item.date,
                time: item.time,
                details: item.details ?? "",
              }))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadCompanyAppointments();
  }, []);

  const scrollToTop = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Appels API réels vers la table `entreprise`
  const {
    data: companies,
    isLoading,
    error,
  } = useCompanies({
    sector: sectorFilter,
    search: searchTerm,
  });

  // Récupérer tous les contrats pour enrichir les entreprises
  const { data: contracts } = useContracts();
  const { data: stats } = useCompanyStats();

  // Fonction pour calculer le montant total des contrats actifs pour une entreprise
  const getContractValueForCompany = (companyId: number): number => {
    if (!contracts || contracts.length === 0) return 0;
    return contracts
      .filter(
        (contract) =>
          contract.entreprise_id === companyId &&
          (contract.statut === "Actif" || contract.statut === "En négociation")
      )
      .reduce((sum, contract) => sum + (typeof contract.montant_annuel === 'string' ? parseFloat(contract.montant_annuel) : contract.montant_annuel), 0);
  };

  // Fonction pour vérifier si une entreprise a un contrat Premium
  const hasContractType = (companyId: number, type: string): boolean => {
    if (!contracts || contracts.length === 0) return false;
    return contracts.some(
      (contract) =>
        contract.entreprise_id === companyId &&
        contract.type_contrat === type
    );
  };

  // Utilisation des données API ou fallback avec normalisation
  const rawCompanies = error
    ? fallbackCompanies
    : companies || fallbackCompanies;
  const normalizedCompanies = rawCompanies.map((company) => {
    const normalized = normalizeCompany(company);
    // Mettre à jour contract_value avec le montant réel des contrats
    return {
      ...normalized,
      contract_value: getContractValueForCompany(company.id || company.id),
    };
  });

  // Filtrage des entreprises
  // Fonction pour vérifier si une entreprise n'a aucun contrat
  const hasNoContract = (companyId: number): boolean => {
    if (!contracts || contracts.length === 0) return true;
    return !contracts.some((contract) => contract.entreprise_id === companyId);
  };

  const filteredCompanies = normalizedCompanies
    .filter(
      (company) =>
        (company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.location
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (sectorFilter === "Tous les secteurs" ||
          company.sector === sectorFilter) &&
        (statusFilter === "Tous les statuts" ||
          company.status === statusFilter) &&
        (contractTypeFilter === "Tous les contrats" ||
          (contractTypeFilter === "Aucun contrat" ? hasNoContract(company.id) : hasContractType(company.id, contractTypeFilter)))
    )
    .sort((a, b) => {
      // Premium contracts appear first
      const aPremium = hasContractType(a.id, 'Premium') ? 1 : 0;
      const bPremium = hasContractType(b.id, 'Premium') ? 1 : 0;
      return bPremium - aPremium;
    });

  // Calcul des statistiques depuis l'API ou fallback
  const totalCompanies = stats?.total_companies || filteredCompanies.length;
  const activeContracts =
    stats?.active_contracts ||
    filteredCompanies.filter((c) => c.status === "Actif").length;
  const totalEmployees =
    stats?.total_employees ||
    filteredCompanies.reduce((sum, c) => sum + c.employees, 0);
  const totalRevenue =
    stats?.total_revenue ||
    filteredCompanies.reduce((sum, c) => sum + c.contract_value, 0);

  const handleCreateCompany = () => {
    if (!newCompanyName.trim() || !newCompanyEmail.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    const finalSector = newCompanySector === "Autre" ? newCompanySectorCustom.trim() : newCompanySector.trim();
    const finalPays = newCompanyPays === "Autre" ? newCompanyPaysCustom.trim() : newCompanyPays.trim();

    createCompany.mutate(
      {
        name: newCompanyName.trim(),
        email_contact: newCompanyEmailContact.trim() || newCompanyEmail.trim(),
        secteur_activite: finalSector || undefined,
        adresse_facturation: newCompanyAdresse.trim() || undefined,
        code_postal: newCompanyCodePostal.trim() || undefined,
        ville: newCompanyVille.trim() || undefined,
        pays: finalPays || undefined,
        siret: newCompanySiret.trim() || undefined,
        numero_tva: newCompanyNumeroTva.trim() || undefined,
        forme_juridique: newCompanyFormeJuridique.trim() || undefined,
        contact_principal: newCompanyContactPrincipal.trim() || undefined,
        telephone_contact: newCompanyTelephoneContact.trim() || undefined,
        nombre_employes: newCompanyNombreEmployes ? parseInt(newCompanyNombreEmployes, 10) : 0,
        site_web: newCompanySiteWeb.trim() || undefined,
        description: newCompanyDescription.trim() || undefined,
        date_premier_contact: newCompanyDatePremierContact || undefined,
        source_lead: newCompanySourceLead.trim() || undefined,
        domain: newCompanyDomain.trim() || undefined,
        is_active: newCompanyIsActive,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          // Réinitialiser tous les champs
          setNewCompanyName("");
          setNewCompanyEmail("");
          setNewCompanySector("");
          setNewCompanyAdresse("");
          setNewCompanyCodePostal("");
          setNewCompanyVille("");
          setNewCompanyPays("");
          setNewCompanySiret("");
          setNewCompanyNumeroTva("");
          setNewCompanyFormeJuridique("");
          setNewCompanyContactPrincipal("");
          setNewCompanyEmailContact("");
          setNewCompanyTelephoneContact("");
          setNewCompanyNombreEmployes("0");
          setNewCompanySiteWeb("");
          setNewCompanyDescription("");
          setNewCompanyDatePremierContact("");
          setNewCompanySourceLead("");
          setNewCompanyDomain("");
          setNewCompanyIsActive(true);
          setNewCompanySectorCustom("");
          setNewCompanyPaysCustom("");
          toast({
            title: "Entreprise créée",
            description: "La nouvelle entreprise a été ajoutée avec succès.",
          });
        },
      }
    );
  };

  const handleEditClick = (company: any) => {
    setEditingCompanyId(company.id);
    setEditCompanyName(company.name || "");
    setEditCompanyEmail(company.email || "");
    setEditCompanySector(company.secteur_activite || company.sector || "");
    setEditCompanyAdresse(company.adresse_facturation || "");
    setEditCompanyCodePostal(company.code_postal || "");
    setEditCompanyVille(company.ville || "");
    setEditCompanyPays(company.pays || "");
    setEditCompanySiret(company.siret || "");
    setEditCompanyNumeroTva(company.numero_tva || "");
    setEditCompanyFormeJuridique(company.forme_juridique || "");
    setEditCompanyContactPrincipal(company.contact_principal || "");
    setEditCompanyEmailContact(company.email_contact || "");
    setEditCompanyTelephoneContact(company.telephone_contact || "");
    setEditCompanyNombreEmployes(String(company.nombre_employes ?? company.employees ?? 0));
    setEditCompanySiteWeb(company.site_web || "");
    setEditCompanyDescription(company.description || "");
    setEditCompanyDatePremierContact(company.date_premier_contact || "");
    setEditCompanySourceLead(company.source_lead || "");
    setEditCompanyDomain(company.domain || "");
    setEditCompanyIsActive(company.is_active !== false);
    setIsEditOpen(true);
  };

  const handleUpdateCompany = () => {
    if (!editingCompanyId || !editCompanyName.trim() || !editCompanyEmail.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    const finalSector = editCompanySector === "Autre" ? editCompanySectorCustom.trim() : editCompanySector.trim();
    const finalPays = editCompanyPays === "Autre" ? editCompanyPaysCustom.trim() : editCompanyPays.trim();

    updateCompany.mutate(
      {
        id: editingCompanyId,
        data: {
          name: editCompanyName.trim(),
          email_contact: editCompanyEmailContact.trim() || editCompanyEmail.trim(),
          secteur_activite: finalSector || undefined,
          adresse_facturation: editCompanyAdresse.trim() || undefined,
          code_postal: editCompanyCodePostal.trim() || undefined,
          ville: editCompanyVille.trim() || undefined,
          pays: finalPays || undefined,
          siret: editCompanySiret.trim() || undefined,
          numero_tva: editCompanyNumeroTva.trim() || undefined,
          forme_juridique: editCompanyFormeJuridique.trim() || undefined,
          contact_principal: editCompanyContactPrincipal.trim() || undefined,
          telephone_contact: editCompanyTelephoneContact.trim() || undefined,
          nombre_employes: editCompanyNombreEmployes ? parseInt(editCompanyNombreEmployes, 10) : 0,
          site_web: editCompanySiteWeb.trim() || undefined,
          description: editCompanyDescription.trim() || undefined,
          date_premier_contact: editCompanyDatePremierContact || undefined,
          source_lead: editCompanySourceLead.trim() || undefined,
          domain: editCompanyDomain.trim() || undefined,
          is_active: editCompanyIsActive,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingCompanyId(null);
          // Réinitialiser tous les champs
          setEditCompanyName("");
          setEditCompanyEmail("");
          setEditCompanySector("");
          setEditCompanyAdresse("");
          setEditCompanyCodePostal("");
          setEditCompanyVille("");
          setEditCompanyPays("");
          setEditCompanySiret("");
          setEditCompanyNumeroTva("");
          setEditCompanyFormeJuridique("");
          setEditCompanyContactPrincipal("");
          setEditCompanyEmailContact("");
          setEditCompanyTelephoneContact("");
          setEditCompanyNombreEmployes("0");
          setEditCompanySiteWeb("");
          setEditCompanyDescription("");
          setEditCompanyDatePremierContact("");
          setEditCompanySourceLead("");
          setEditCompanyDomain("");
          setEditCompanyIsActive(true);
          setEditCompanySectorCustom("");
          setEditCompanyPaysCustom("");
          toast({
            title: "Entreprise mise à jour",
            description: "Les informations de l'entreprise ont été modifiées avec succès.",
          });
        },
      }
    );
  };

  const handleDeleteClick = (company: any) => {
    setDeletingCompanyId(company.id);
    setDeletingCompanyName(company.name || "");
    setIsDeleteOpen(true);
  };

  const handleDeleteCompany = () => {
    if (!deletingCompanyId) {
      return;
    }

    deleteCompany.mutate(deletingCompanyId, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setDeletingCompanyId(null);
        setDeletingCompanyName("");
        toast({
          title: "Entreprise supprimée",
          description: "L'entreprise a été supprimée avec succès.",
        });
      },
    });
  };

  const handleScheduleRdv = async () => {
    if (!selectedDate || !selectedCompanyForRdv) return;
    const minTime = getMinTimeForDate(selectedDate);
    if (isSameDay(selectedDate, new Date()) && selectedTime < minTime) {
      toast({
        title: "Heure invalide",
        description: "Veuillez choisir une heure a partir de maintenant.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${COMPANY_API_BASE_URL}/company-appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entreprise_id: selectedCompanyForRdv,
          date: selectedDate.toISOString().split("T")[0],
          time: selectedTime,
          details: rdvDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Erreur lors de la planification du RDV");
      }

      const company = normalizedCompanies.find((c) => c.id === selectedCompanyForRdv);
      setRdvList((prev) => [
        {
          id: data.data.id,
          companyId: data.data.entreprise_id,
          date: data.data.date,
          time: data.data.time,
          details: data.data.details ?? "",
        },
        ...prev,
      ]);
      toast({
        title: "RDV planifié",
        description: `Rendez-vous avec ${company?.name} planifié pour le ${selectedDate.toLocaleDateString('fr-FR')} à ${selectedTime}`,
      });
      setIsScheduleOpen(false);
      setSelectedDate(null);
      setSelectedCompanyForRdv(null);
      setSelectedTime("10:00");
      setRdvDetails("");
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le rendez-vous",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRdv = async (rdvId: number, companyName: string) => {
    try {
      const response = await fetch(`${COMPANY_API_BASE_URL}/company-appointments/${rdvId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Erreur lors de l'annulation du RDV");
      }

      setRdvList((prev) => prev.filter((rdv) => rdv.id !== rdvId));
      toast({
        title: "RDV annulé",
        description: `Le rendez-vous avec ${companyName} a été annulé`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler le rendez-vous",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statistiques */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
            <p className="text-sm text-gray-600">
              Gestion des entreprises partenaires et contrats
            </p>
          </div>
          <Button
            className="w-full md:w-auto bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une entreprise
          </Button>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalCompanies}
                  </div>
                  <div className="text-sm text-gray-600">Total entreprises</div>
                  <div className="text-xs text-green-600">
                    {activeContracts} actifs
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setIsRdvListOpen(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {rdvList.length}
                  </div>
                  <div className="text-sm text-gray-600">Rendez-vous planifiés</div>
                  <div className="text-xs text-blue-600">
                    Cliquez pour voir la liste
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ... autres cartes de statistiques ... */}
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="px-6 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center flex-1">
            <div className="relative w-full min-w-0 flex-1 lg:max-w-md">
              <Input
                type="search"
                placeholder="Rechercher par nom, secteur ou localisation..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les secteurs">
                  Tous les secteurs
                </SelectItem>
                <SelectItem value="Technologie">Technologie</SelectItem>
                <SelectItem value="Santé">Santé</SelectItem>
                <SelectItem value="Énergie">Énergie</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Éducation">Éducation</SelectItem>
                <SelectItem value="Logistique">Logistique</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les statuts">
                  Tous les statuts
                </SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={contractTypeFilter} onValueChange={setContractTypeFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les contrats">
                  Tous les contrats
                </SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
                <SelectItem value="Aucun contrat">Aucun contrat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 xl:text-right">
            {filteredCompanies.length} entreprise
            {filteredCompanies.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Liste des entreprises */}
      <div className="px-6 pb-6">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">
              Chargement des entreprises...
            </span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">
              Erreur lors du chargement des entreprises
            </div>
            <div className="text-sm text-gray-500">
              Affichage des données de démonstration
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Card
              key={company.id}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => {
                setSelectedCompanyDetails(company);
                setIsDetailsOpen(true);
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      <Building2 className="inline-block w-5 h-5 mr-2 text-green-600" />
                      {company.name}
                      {hasContractType(company.id, 'Premium') && (
                        <Star className="inline-block w-4 h-4 text-yellow-400 ml-2 fill-yellow-400" />
                      )}
                      {company.verified && (
                        <CheckCircle className="inline-block w-4 h-4 text-green-500 ml-2" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600 mb-1">
                      {company.sector}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      company.status === "Actif" ? "default" : "secondary"
                    }
                    className={`text-xs ${company.status === "Actif" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {company.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span>{company.location}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
                    <span>{company.employees} employés</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span>{company.phone}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
                    <span className="truncate">{company.email}</span>
                  </div>

                  {company.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {company.website}
                      </a>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Cliquez pour voir tous les détails →
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="w-full sm:flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompanyForRdv(company.id);
                          setIsScheduleOpen(true);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Planifier RDV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(company);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(company);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-xs text-gray-500">
                        Contrat:{" "}
                        <span className="font-medium text-green-600">
                          {company.contract_value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog de création d'entreprise */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une entreprise</DialogTitle>
            <DialogDescription>
              Créez une nouvelle entreprise dans votre espace JoyAtWork.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nom de l'entreprise *</label>
              <Input
                placeholder="Nom de l'entreprise"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Secteur d'activité *</label>
              <Select value={newCompanySector} onValueChange={setNewCompanySector}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technologie">Technologie</SelectItem>
                  <SelectItem value="Santé">Santé</SelectItem>
                  <SelectItem value="Énergie">Énergie</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Éducation">Éducation</SelectItem>
                  <SelectItem value="Logistique">Logistique</SelectItem>
                  <SelectItem value="Restauration">Restauration</SelectItem>
                  <SelectItem value="Conseil">Conseil</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {newCompanySector === "Autre" && (
                <Input
                  placeholder="Spécifiez le secteur d'activité"
                  value={newCompanySectorCustom}
                  onChange={(e) => setNewCompanySectorCustom(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <Input
                type="email"
                placeholder="contact@entreprise.com"
                value={newCompanyEmail}
                onChange={(e) => setNewCompanyEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Adresse de facturation</label>
              <Input
                placeholder="123 Rue de la Paix"
                value={newCompanyAdresse}
                onChange={(e) => setNewCompanyAdresse(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Code postal</label>
              <Input
                placeholder="75001"
                value={newCompanyCodePostal}
                onChange={(e) => setNewCompanyCodePostal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ville</label>
              <Input
                placeholder="Paris"
                value={newCompanyVille}
                onChange={(e) => setNewCompanyVille(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pays</label>
              <Select value={newCompanyPays} onValueChange={setNewCompanyPays}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Belgique">Belgique</SelectItem>
                  <SelectItem value="Suisse">Suisse</SelectItem>
                  <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                  <SelectItem value="Allemagne">Allemagne</SelectItem>
                  <SelectItem value="Espagne">Espagne</SelectItem>
                  <SelectItem value="Italie">Italie</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {newCompanyPays === "Autre" && (
                <Input
                  placeholder="Spécifiez le pays"
                  value={newCompanyPaysCustom}
                  onChange={(e) => setNewCompanyPaysCustom(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">SIRET</label>
              <Input
                placeholder="12345678901234"
                value={newCompanySiret}
                onChange={(e) => setNewCompanySiret(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Numéro TVA</label>
              <Input
                placeholder="FR12345678901"
                value={newCompanyNumeroTva}
                onChange={(e) => setNewCompanyNumeroTva(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Forme juridique</label>
              <Input
                placeholder="SARL, EIRL, SAS..."
                value={newCompanyFormeJuridique}
                onChange={(e) => setNewCompanyFormeJuridique(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contact principal</label>
              <Input
                placeholder="Nom du contact"
                value={newCompanyContactPrincipal}
                onChange={(e) => setNewCompanyContactPrincipal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email contact</label>
              <Input
                type="email"
                placeholder="contact@entreprise.com"
                value={newCompanyEmailContact}
                onChange={(e) => setNewCompanyEmailContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Téléphone contact</label>
              <Input
                placeholder="+33123456789"
                value={newCompanyTelephoneContact}
                onChange={(e) => setNewCompanyTelephoneContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre d'employés</label>
              <Input
                type="number"
                min={0}
                value={newCompanyNombreEmployes}
                onChange={(e) => setNewCompanyNombreEmployes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Site web</label>
              <Input
                placeholder="https://www.entreprise.com"
                value={newCompanySiteWeb}
                onChange={(e) => setNewCompanySiteWeb(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                rows={3}
                placeholder="Présentation de l'entreprise"
                value={newCompanyDescription}
                onChange={(e) => setNewCompanyDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date premier contact</label>
              <Input
                type="date"
                value={newCompanyDatePremierContact}
                onChange={(e) => setNewCompanyDatePremierContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source lead</label>
              <Input
                placeholder="Website, Référence, Salon..."
                value={newCompanySourceLead}
                onChange={(e) => setNewCompanySourceLead(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Domain</label>
              <Input
                placeholder="entreprise.fr"
                value={newCompanyDomain}
                onChange={(e) => setNewCompanyDomain(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="new-company-is-active"
                type="checkbox"
                className="h-4 w-4"
                checked={newCompanyIsActive}
                onChange={(e) => setNewCompanyIsActive(e.target.checked)}
              />
              <label htmlFor="new-company-is-active" className="text-sm text-gray-700">
                Entreprise active
              </label>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              type="button"
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleCreateCompany}
              disabled={createCompany.isPending}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification d'entreprise */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'entreprise</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'entreprise sélectionnée.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nom de l'entreprise *</label>
              <Input
                placeholder="Nom de l'entreprise"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Secteur d'activité *</label>
              <Select value={editCompanySector} onValueChange={setEditCompanySector}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technologie">Technologie</SelectItem>
                  <SelectItem value="Santé">Santé</SelectItem>
                  <SelectItem value="Énergie">Énergie</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Éducation">Éducation</SelectItem>
                  <SelectItem value="Logistique">Logistique</SelectItem>
                  <SelectItem value="Restauration">Restauration</SelectItem>
                  <SelectItem value="Conseil">Conseil</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {editCompanySector === "Autre" && (
                <Input
                  placeholder="Spécifiez le secteur d'activité"
                  value={editCompanySectorCustom}
                  onChange={(e) => setEditCompanySectorCustom(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <Input
                type="email"
                placeholder="contact@entreprise.com"
                value={editCompanyEmail}
                onChange={(e) => setEditCompanyEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Adresse de facturation</label>
              <Input
                placeholder="123 Rue de la Paix"
                value={editCompanyAdresse}
                onChange={(e) => setEditCompanyAdresse(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Code postal</label>
              <Input
                placeholder="75001"
                value={editCompanyCodePostal}
                onChange={(e) => setEditCompanyCodePostal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ville</label>
              <Input
                placeholder="Paris"
                value={editCompanyVille}
                onChange={(e) => setEditCompanyVille(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pays</label>
              <Select value={editCompanyPays} onValueChange={setEditCompanyPays}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Belgique">Belgique</SelectItem>
                  <SelectItem value="Suisse">Suisse</SelectItem>
                  <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                  <SelectItem value="Allemagne">Allemagne</SelectItem>
                  <SelectItem value="Espagne">Espagne</SelectItem>
                  <SelectItem value="Italie">Italie</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              {editCompanyPays === "Autre" && (
                <Input
                  placeholder="Spécifiez le pays"
                  value={editCompanyPaysCustom}
                  onChange={(e) => setEditCompanyPaysCustom(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">SIRET</label>
              <Input
                placeholder="12345678901234"
                value={editCompanySiret}
                onChange={(e) => setEditCompanySiret(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Numéro TVA</label>
              <Input
                placeholder="FR12345678901"
                value={editCompanyNumeroTva}
                onChange={(e) => setEditCompanyNumeroTva(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Forme juridique</label>
              <Input
                placeholder="SARL, EIRL, SAS..."
                value={editCompanyFormeJuridique}
                onChange={(e) => setEditCompanyFormeJuridique(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contact principal</label>
              <Input
                placeholder="Nom du contact"
                value={editCompanyContactPrincipal}
                onChange={(e) => setEditCompanyContactPrincipal(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email contact</label>
              <Input
                type="email"
                placeholder="contact@entreprise.com"
                value={editCompanyEmailContact}
                onChange={(e) => setEditCompanyEmailContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Téléphone contact</label>
              <Input
                placeholder="+33123456789"
                value={editCompanyTelephoneContact}
                onChange={(e) => setEditCompanyTelephoneContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre d'employés</label>
              <Input
                type="number"
                min={0}
                value={editCompanyNombreEmployes}
                onChange={(e) => setEditCompanyNombreEmployes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Site web</label>
              <Input
                placeholder="https://www.entreprise.com"
                value={editCompanySiteWeb}
                onChange={(e) => setEditCompanySiteWeb(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                rows={3}
                placeholder="Présentation de l'entreprise"
                value={editCompanyDescription}
                onChange={(e) => setEditCompanyDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date premier contact</label>
              <Input
                type="date"
                value={editCompanyDatePremierContact}
                onChange={(e) => setEditCompanyDatePremierContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Source lead</label>
              <Input
                placeholder="Website, Référence, Salon..."
                value={editCompanySourceLead}
                onChange={(e) => setEditCompanySourceLead(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Domain</label>
              <Input
                placeholder="entreprise.fr"
                value={editCompanyDomain}
                onChange={(e) => setEditCompanyDomain(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="edit-company-is-active"
                type="checkbox"
                className="h-4 w-4"
                checked={editCompanyIsActive}
                onChange={(e) => setEditCompanyIsActive(e.target.checked)}
              />
              <label htmlFor="edit-company-is-active" className="text-sm text-gray-700">
                Entreprise active
              </label>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              type="button"
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleUpdateCompany}
              disabled={updateCompany.isPending}
            >
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de confirmation de suppression */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'entreprise</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'entreprise{" "}
              <strong>{deletingCompanyName}</strong> ? Cette action est
              irréversible et supprimera définitivement toutes les données
              associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCompany}
              disabled={deleteCompany.isPending}
            >
              {deleteCompany.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog pour afficher tous les détails d'une entreprise */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Building2 className="w-6 h-6 text-green-600" />
              {selectedCompanyDetails?.name}
            </DialogTitle>
            <DialogDescription>
              Informations complètes de l'entreprise
            </DialogDescription>
          </DialogHeader>

          {selectedCompanyDetails && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Informations générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nom</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Secteur d'activité</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.sector || selectedCompanyDetails.secteur_activite || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Domaine</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.domain || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statut</p>
                    <Badge variant={selectedCompanyDetails.is_active ? "default" : "secondary"} className={selectedCompanyDetails.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {selectedCompanyDetails.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre d'employés</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.employees || selectedCompanyDetails.nombre_employes || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Forme juridique</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.forme_juridique || "Non renseigné"}</p>
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-600" />
                  Coordonnées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.email || selectedCompanyDetails.email_contact || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Téléphone</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.phone || selectedCompanyDetails.telephone_contact || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact principal</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.contact_principal || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Site web</p>
                    {selectedCompanyDetails.website || selectedCompanyDetails.site_web ? (
                      <a
                        href={selectedCompanyDetails.website || selectedCompanyDetails.site_web}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedCompanyDetails.website || selectedCompanyDetails.site_web}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-900">Non renseigné</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Adresse
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Adresse de facturation</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.adresse_facturation || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Code postal</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.code_postal || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ville</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.ville || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pays</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.pays || "Non renseigné"}</p>
                  </div>
                </div>
              </div>

              {/* Informations légales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Informations légales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">SIRET</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.siret || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Numéro TVA</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.numero_tva || "Non renseigné"}</p>
                  </div>
                </div>
              </div>

              {/* Informations commerciales */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Informations commerciales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date premier contact</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.date_premier_contact || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Source lead</p>
                    <p className="text-sm text-gray-900">{selectedCompanyDetails.source_lead || "Non renseigné"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Valeur du contrat</p>
                    <p className="text-sm text-gray-900 font-semibold text-green-600">{selectedCompanyDetails.contract_value?.toLocaleString() || "0"}€</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedCompanyDetails.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCompanyDetails.description}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
            >
              Fermer
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setIsDetailsOpen(false);
                handleEditClick(selectedCompanyDetails);
              }}
            >
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour planifier un RDV avec date picker */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier un rendez-vous</DialogTitle>
            <DialogDescription>
              Rendez-vous avec {normalizedCompanies.find(c => c.id === selectedCompanyForRdv)?.name || "l'entreprise"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <Input
                type="date"
                value={selectedDate ? toDateString(selectedDate) : ''}
                min={toDateString(new Date())}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (date < today) {
                    toast({
                      title: "Date invalide",
                      description: "Veuillez choisir une date a partir d'aujourd'hui.",
                      variant: "destructive",
                    });
                    return;
                  }
                  setSelectedDate(date);
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Heure</label>
              <Input
                type="time"
                value={selectedTime}
                min={getMinTimeForDate(selectedDate)}
                onChange={(e) => setSelectedTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Détails (optionnel)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ajoutez des détails supplémentaires sur le rendez-vous..."
                rows={4}
                value={rdvDetails}
                onChange={(e) => setRdvDetails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsScheduleOpen(false);
                setSelectedDate(null);
                setSelectedCompanyForRdv(null);
                setSelectedTime("10:00");
                setRdvDetails("");
              }}
            >
              Annuler
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleScheduleRdv}
            >
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour afficher la liste des RDV */}
      <Dialog open={isRdvListOpen} onOpenChange={setIsRdvListOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rendez-vous planifiés</DialogTitle>
            <DialogDescription>
              Liste des entreprises avec rendez-vous prévus
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {rdvList.length > 0 ? (
              rdvList.map((rdv) => {
                const company = normalizedCompanies.find(c => c.id === rdv.companyId);
                if (!company) return null;
                return (
                  <Card key={rdv.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">{company.sector}</p>
                        <p className="text-sm text-gray-600 mt-1">📍 {company.location}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">
                            {new Date(rdv.date).toLocaleDateString('fr-FR')} à {rdv.time}
                          </span>
                        </div>
                        {rdv.details && (
                          <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1">Détails :</p>
                            <p className="text-sm text-gray-600">{rdv.details}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className="bg-blue-100 text-blue-800">Confirmé</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteRdv(rdv.id, company.name)}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun rendez-vous planifié</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bouton Scroll to Top */}
      <button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#16a34a',
          color: 'white',
          padding: '0.75rem',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 9999,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
        title="Retour au haut"
      >
        <ChevronUp style={{ width: '24px', height: '24px' }} />
      </button>
    </div>
  );
};

export default CompaniesDashboard;
