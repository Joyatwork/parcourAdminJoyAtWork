import { useState } from "react";
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
  Plus,
  CheckCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  useCompanies,
  useCompanyStats,
  useCreateCompany,
  useUpdateCompany,
  useDeleteCompany,
} from "@/hooks/useCompanies";
import { toast } from "@/components/ui/use-toast";

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
const normalizeCompany = (company: any) => ({
  // Valeurs par défaut pour garder le même design
  sector: company.sector ?? "Secteur non défini",
  location: company.location ?? "Localisation non définie",
  employees: company.employees ?? 0,
  phone: company.phone ?? "",
  email: company.email ?? "",
  website: company.website ?? "",
  description: company.description ?? "",
  status:
    company.status ??
    (typeof company.is_active === "boolean"
      ? company.is_active
        ? "Actif"
        : "Inactif"
      : "En négociation"),
  verified: company.verified ?? false,
  // Normalisation des tableaux / montants
  wellness_programs:
    company.wellness_programs || company.wellnessPrograms || [],
  contract_value:
    typeof company.contract_value === "number"
      ? company.contract_value
      : parseInt(company.contractValue || "0") || 0,
  // On conserve les autres champs existants (id, name, domain, created_at, updated_at, etc.)
  ...company,
});

const CompaniesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("Tous les secteurs");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDomain, setNewCompanyDomain] = useState("");
  const [newCompanyStatus, setNewCompanyStatus] = useState<
    "active" | "inactive"
  >("active");

  // États pour l'édition d'entreprise
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editCompanyDomain, setEditCompanyDomain] = useState("");
  const [editCompanyStatus, setEditCompanyStatus] = useState<
    "active" | "inactive"
  >("active");

  // États pour la suppression d'entreprise
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCompanyId, setDeletingCompanyId] = useState<number | null>(
    null
  );
  const [deletingCompanyName, setDeletingCompanyName] = useState("");

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  // Appels API réels vers la table `entreprise`
  const {
    data: companies,
    isLoading,
    error,
  } = useCompanies({
    sector: sectorFilter,
    search: searchTerm,
  });
  const { data: stats } = useCompanyStats();

  // Utilisation des données API ou fallback avec normalisation
  const rawCompanies = error
    ? fallbackCompanies
    : companies || fallbackCompanies;
  const normalizedCompanies = rawCompanies.map(normalizeCompany);

  // Filtrage des entreprises si pas d'API (fallback)
  const filteredCompanies = error
    ? normalizedCompanies.filter(
        (company) =>
          (company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.location
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) &&
          (sectorFilter === "Tous les secteurs" ||
            company.sector === sectorFilter)
      )
    : normalizedCompanies;

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
    if (!newCompanyName.trim()) {
      return;
    }

    createCompany.mutate(
      {
        name: newCompanyName.trim(),
        domain: newCompanyDomain.trim() || null,
        is_active: newCompanyStatus === "active",
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewCompanyName("");
          setNewCompanyDomain("");
          setNewCompanyStatus("active");
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
    setEditCompanyDomain(company.domain || "");
    // Déterminer le statut : utiliser is_active si disponible, sinon déduire de status
    if (typeof company.is_active === "boolean") {
      setEditCompanyStatus(company.is_active ? "active" : "inactive");
    } else if (company.status === "Actif") {
      setEditCompanyStatus("active");
    } else if (company.status === "Inactif") {
      setEditCompanyStatus("inactive");
    } else {
      setEditCompanyStatus("active"); // Par défaut
    }
    setIsEditOpen(true);
  };

  const handleUpdateCompany = () => {
    if (!editingCompanyId || !editCompanyName.trim()) {
      return;
    }

    updateCompany.mutate(
      {
        id: editingCompanyId,
        data: {
          name: editCompanyName.trim(),
          domain: editCompanyDomain.trim() || null,
          is_active: editCompanyStatus === "active",
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingCompanyId(null);
          setEditCompanyName("");
          setEditCompanyDomain("");
          setEditCompanyStatus("active");
          toast({
            title: "Entreprise mise à jour",
            description:
              "Les informations de l'entreprise ont été modifiées avec succès.",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statistiques */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
            <p className="text-sm text-gray-600">
              Gestion des entreprises partenaires et contrats
            </p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700"
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
                    {activeContracts} contrats actifs
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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
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
              <SelectTrigger className="w-48">
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
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Filtrer
            </Button>
            <div className="text-sm text-gray-500">
              {filteredCompanies.length} entreprise
              {filteredCompanies.length > 1 ? "s" : ""}
            </div>
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
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      <Building2 className="inline-block w-5 h-5 mr-2 text-green-600" />
                      {company.name}
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

                  <p className="text-sm text-gray-600 mt-3">
                    {company.description}
                  </p>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Programmes bien-être :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {company.wellness_programs.map((program, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs bg-blue-50 text-blue-700"
                        >
                          {program}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Planifier RDV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEditClick(company)}
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick(company)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-xs text-gray-500">
                        Contrat:{" "}
                        <span className="font-medium text-green-600">
                          {company.contract_value.toLocaleString()}€
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une entreprise</DialogTitle>
            <DialogDescription>
              Créez une nouvelle entreprise dans votre espace JoyAtWork.
            </DialogDescription>
          </DialogHeader>

          {/* Formulaire simple - la logique sera branchée à l'étape 4 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom de l'entreprise
              </label>
              <Input
                placeholder="Nom de l'entreprise"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Domaine / Site web
              </label>
              <Input
                placeholder="ex: mon-entreprise.com"
                value={newCompanyDomain}
                onChange={(e) => setNewCompanyDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Statut
              </label>
              <Select
                value={newCompanyStatus}
                onValueChange={(value: "active" | "inactive") =>
                  setNewCompanyStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'entreprise</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'entreprise sélectionnée.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom de l'entreprise
              </label>
              <Input
                placeholder="Nom de l'entreprise"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Domaine / Site web
              </label>
              <Input
                placeholder="ex: mon-entreprise.com"
                value={editCompanyDomain}
                onChange={(e) => setEditCompanyDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Statut
              </label>
              <Select
                value={editCompanyStatus}
                onValueChange={(value: "active" | "inactive") =>
                  setEditCompanyStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
};

export default CompaniesDashboard;
