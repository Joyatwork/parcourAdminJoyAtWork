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
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Plus,
  Loader2,
  Trash2,
  Edit,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  useContracts,
  useContractStats,
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
  Contract,
} from "@/hooks/useContracts";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "@/components/ui/use-toast";

const ContractsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("Tous les statuts");
  const [typeFilter, setTypeFilter] = useState("Tous les types");
  const [entrepriseFilter, setEntrepriseFilter] = useState<number | null>(null);

  // États pour la création
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newContractEntrepriseId, setNewContractEntrepriseId] = useState<
    number | null
  >(null);
  const [newContractType, setNewContractType] = useState<
    "Standard" | "Premium" | "Enterprise"
  >("Standard");
  const [newContractStatut, setNewContractStatut] = useState<
    "En négociation" | "En attente signature" | "Actif" | "Expiré" | "Résilié"
  >("En négociation");
  const [newContractDateDebut, setNewContractDateDebut] = useState("");
  const [newContractDateFin, setNewContractDateFin] = useState("");
  const [newContractMontantAnnuel, setNewContractMontantAnnuel] = useState("");
  const [newContractEmployeesCovered, setNewContractEmployeesCovered] = useState("");
  const [newContractDescription, setNewContractDescription] = useState("");

  // États pour l'édition
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContractId, setEditingContractId] = useState<number | null>(
    null
  );
  const [editContractType, setEditContractType] = useState<
    "Standard" | "Premium" | "Enterprise"
  >("Standard");
  const [editContractStatut, setEditContractStatut] = useState<
    "En négociation" | "En attente signature" | "Actif" | "Expiré" | "Résilié"
  >("En négociation");
  const [editContractDateDebut, setEditContractDateDebut] = useState("");
  const [editContractDateFin, setEditContractDateFin] = useState("");
  const [editContractMontantAnnuel, setEditContractMontantAnnuel] =
    useState("");
  const [editContractEmployeesCovered, setEditContractEmployeesCovered] = useState("");
  const [editContractDescription, setEditContractDescription] = useState("");

  // États pour la suppression
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingContractId, setDeletingContractId] = useState<number | null>(
    null
  );
  const [deletingContractNumero, setDeletingContractNumero] = useState("");

  // Hooks
  const { data: companies } = useCompanies();
  const {
    data: contracts,
    isLoading,
    error,
  } = useContracts({
    entreprise_id: entrepriseFilter || undefined,
    statut: statutFilter !== "Tous les statuts" ? statutFilter : undefined,
    search: searchTerm || undefined,
  });
  const { data: stats } = useContractStats();
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();

  // Données de fallback
  const fallbackContracts: Contract[] = [];

  const rawContracts = error
    ? fallbackContracts
    : contracts || fallbackContracts;

  // Appliquer le filtre de type côté client
  const displayedContracts = typeFilter === "Tous les types" 
    ? rawContracts 
    : rawContracts.filter(contract => contract.type_contrat === typeFilter);

  // Filtrer les entreprises qui n'ont pas déjà de contrat
  const companiesWithoutContract = companies?.filter(
    (company) =>
      !displayedContracts.some((contract) => contract.entreprise_id === company.id)
  ) || [];

  // Handlers
  const handleCreateContract = () => {
    if (
      !newContractEntrepriseId ||
      !newContractDateDebut ||
      !newContractMontantAnnuel
    ) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    createContract.mutate(
      {
        entreprise_id: newContractEntrepriseId,
        type_contrat: newContractType,
        statut: newContractStatut,
        date_debut: newContractDateDebut,
        date_fin: newContractDateFin || null,
        montant_annuel: parseFloat(newContractMontantAnnuel),
        nombre_employes_couverts: newContractEmployeesCovered ? parseInt(newContractEmployeesCovered, 10) : 0,
        description: newContractDescription || null,
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewContractEntrepriseId(null);
          setNewContractType("Standard");
          setNewContractStatut("En négociation");
          setNewContractDateDebut("");
          setNewContractDateFin("");
          setNewContractMontantAnnuel("");
          setNewContractEmployeesCovered("");
          setNewContractDescription("");
          toast({
            title: "Contrat créé",
            description: "Le nouveau contrat a été créé avec succès.",
          });
        },
      }
    );
  };

  const handleEditClick = (contract: Contract) => {
    setEditingContractId(contract.id);
    setEditContractType(contract.type_contrat);
    setEditContractStatut(contract.statut);
    setEditContractDateDebut(contract.date_debut);
    setEditContractDateFin(contract.date_fin || "");
    setEditContractMontantAnnuel(contract.montant_annuel.toString());
    setEditContractEmployeesCovered(contract.nombre_employes_couverts?.toString() || "0");
    setEditContractDescription(contract.description || "");
    setIsEditOpen(true);
  };

  const handleUpdateContract = () => {
    if (
      !editingContractId ||
      !editContractDateDebut ||
      !editContractMontantAnnuel
    ) {
      return;
    }

    updateContract.mutate(
      {
        id: editingContractId,
        data: {
          type_contrat: editContractType,
          statut: editContractStatut,
          date_debut: editContractDateDebut,
          date_fin: editContractDateFin || null,
          montant_annuel: parseFloat(editContractMontantAnnuel),
          nombre_employes_couverts: editContractEmployeesCovered ? parseInt(editContractEmployeesCovered, 10) : 0,
          description: editContractDescription || null,
        },
      },
      {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingContractId(null);
          toast({
            title: "Contrat mis à jour",
            description: "Le contrat a été modifié avec succès.",
          });
        },
      }
    );
  };

  const handleDeleteClick = (contract: Contract) => {
    setDeletingContractId(contract.id);
    setDeletingContractNumero(contract.numero_contrat);
    setIsDeleteOpen(true);
  };

  const handleDeleteContract = () => {
    if (!deletingContractId) {
      return;
    }

    deleteContract.mutate(deletingContractId, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setDeletingContractId(null);
        setDeletingContractNumero("");
        toast({
          title: "Contrat supprimé",
          description: "Le contrat a été supprimé avec succès.",
        });
      },
    });
  };

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatutBadgeColor = (statut: string) => {
    switch (statut) {
      case "Actif":
        return "bg-green-100 text-green-800";
      case "En négociation":
        return "bg-yellow-100 text-yellow-800";
      case "En attente signature":
        return "bg-blue-100 text-blue-800";
      case "Expiré":
        return "bg-red-100 text-red-800";
      case "Résilié":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir l'icône selon le statut
  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case "Actif":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "En négociation":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "En attente signature":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Expiré":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "Résilié":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statistiques */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contrats</h1>
            <p className="text-sm text-gray-600">
              Gestion des contrats avec les entreprises partenaires
            </p>
          </div>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau contrat
          </Button>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.total_contrats || displayedContracts.length}
                  </div>
                  <div className="text-sm text-gray-600">Total contrats</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.contrats_actifs || 0}
                  </div>
                  <div className="text-sm text-gray-600">Contrats actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.contrats_en_negociation || 0}
                  </div>
                  <div className="text-sm text-gray-600">En négociation</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats?.chiffre_affaires_annuel
                      ? `${(stats.chiffre_affaires_annuel / 1000).toFixed(0)}k`
                      : "0"}
                  </div>
                  <div className="text-sm text-gray-600">CA annuel (€)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Rechercher par numéro ou description..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les statuts">
                  Tous les statuts
                </SelectItem>
                <SelectItem value="En négociation">En négociation</SelectItem>
                <SelectItem value="En attente signature">
                  En attente signature
                </SelectItem>
                <SelectItem value="Actif">Actif</SelectItem>
                <SelectItem value="Expiré">Expiré</SelectItem>
                <SelectItem value="Résilié">Résilié</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les types">
                  Tous les types
                </SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={entrepriseFilter?.toString() || "Toutes les entreprises"}
              onValueChange={(value) =>
                setEntrepriseFilter(
                  value === "Toutes les entreprises" ? null : parseInt(value)
                )
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Toutes les entreprises">
                  Toutes les entreprises
                </SelectItem>
                {companies?.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {displayedContracts.length} contrat
              {displayedContracts.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des contrats */}
      <div className="px-6 pb-6">
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">
              Chargement des contrats...
            </span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">
              Erreur lors du chargement des contrats
            </div>
            <div className="text-sm text-gray-500">
              Vérifiez que le serveur backend est démarré
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedContracts.map((contract) => (
            <Card
              key={contract.id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      <FileText className="inline-block w-5 h-5 mr-2 text-green-600" />
                      {contract.numero_contrat}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600 mb-1">
                      {contract.entreprise?.name || "Entreprise inconnue"}
                    </CardDescription>
                  </div>
                  <Badge
                    className={`text-xs ${getStatutBadgeColor(contract.statut)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getStatutIcon(contract.statut)}
                      {contract.statut}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                    <span className="font-medium">{contract.type_contrat}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
                    <span>
                      Du{" "}
                      {new Date(contract.date_debut).toLocaleDateString(
                        "fr-FR"
                      )}
                      {contract.date_fin &&
                        ` au ${new Date(contract.date_fin).toLocaleDateString("fr-FR")}`}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-green-500" />
                    <span>
                      {contract.montant_annuel.toLocaleString("fr-FR")}{" "}
                      {contract.devise}/an
                    </span>
                    {contract.montant_mensuel && (
                      <span className="text-gray-400 ml-2">
                        ({contract.montant_mensuel.toLocaleString("fr-FR")}{" "}
                        {contract.devise}/mois)
                      </span>
                    )}
                  </div>

                  {contract.nombre_employes_couverts && (
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500" />
                      <span>
                        {contract.nombre_employes_couverts} employés couverts
                      </span>
                    </div>
                  )}

                  {contract.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {contract.description}
                    </p>
                  )}

                  <div className="pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEditClick(contract)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteClick(contract)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!isLoading && !error && displayedContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun contrat trouvé</p>
            <p className="text-sm text-gray-500 mt-2">
              Créez votre premier contrat en cliquant sur "Nouveau contrat"
            </p>
          </div>
        )}
      </div>

      {/* Dialog de création */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau contrat</DialogTitle>
            <DialogDescription>
              Créez un nouveau contrat pour une entreprise
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Entreprise *
              </label>
              <Select
                value={newContractEntrepriseId?.toString() || ""}
                onValueChange={(value) =>
                  setNewContractEntrepriseId(parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une entreprise" />
                </SelectTrigger>
                <SelectContent>
                  {companiesWithoutContract && companiesWithoutContract.length > 0 ? (
                    companiesWithoutContract.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Toutes les entreprises ont déjà un contrat
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Type de contrat
                </label>
                <Select
                  value={newContractType}
                  onValueChange={(
                    value: "Standard" | "Premium" | "Enterprise"
                  ) => setNewContractType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Statut
                </label>
                <Select
                  value={newContractStatut}
                  onValueChange={(
                    value:
                      | "En négociation"
                      | "En attente signature"
                      | "Actif"
                      | "Expiré"
                      | "Résilié"
                  ) => setNewContractStatut(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En négociation">
                      En négociation
                    </SelectItem>
                    <SelectItem value="En attente signature">
                      En attente signature
                    </SelectItem>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Expiré">Expiré</SelectItem>
                    <SelectItem value="Résilié">Résilié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date de début *
                </label>
                <Input
                  type="date"
                  value={newContractDateDebut}
                  onChange={(e) => setNewContractDateDebut(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={newContractDateFin}
                  onChange={(e) => setNewContractDateFin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Montant annuel (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 45000"
                value={newContractMontantAnnuel}
                onChange={(e) => setNewContractMontantAnnuel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre d'employés couverts
              </label>
              <Input
                type="number"
                min={0}
                placeholder="Ex: 50"
                value={newContractEmployeesCovered}
                onChange={(e) => setNewContractEmployeesCovered(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md"
                placeholder="Description du contrat..."
                value={newContractDescription}
                onChange={(e) => setNewContractDescription(e.target.value)}
              />
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
              onClick={handleCreateContract}
              disabled={createContract.isPending}
            >
              {createContract.isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le contrat</DialogTitle>
            <DialogDescription>
              Modifiez les informations du contrat
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Type de contrat
                </label>
                <Select
                  value={editContractType}
                  onValueChange={(
                    value: "Standard" | "Premium" | "Enterprise"
                  ) => setEditContractType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Statut
                </label>
                <Select
                  value={editContractStatut}
                  onValueChange={(
                    value:
                      | "En négociation"
                      | "En attente signature"
                      | "Actif"
                      | "Expiré"
                      | "Résilié"
                  ) => setEditContractStatut(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En négociation">
                      En négociation
                    </SelectItem>
                    <SelectItem value="En attente signature">
                      En attente signature
                    </SelectItem>
                    <SelectItem value="Actif">Actif</SelectItem>
                    <SelectItem value="Expiré">Expiré</SelectItem>
                    <SelectItem value="Résilié">Résilié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date de début *
                </label>
                <Input
                  type="date"
                  value={editContractDateDebut}
                  onChange={(e) => setEditContractDateDebut(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <Input
                  type="date"
                  value={editContractDateFin}
                  onChange={(e) => setEditContractDateFin(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Montant annuel (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 45000"
                value={editContractMontantAnnuel}
                onChange={(e) => setEditContractMontantAnnuel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nombre d'employés couverts
              </label>
              <Input
                type="number"
                min={0}
                placeholder="Ex: 50"
                value={editContractEmployeesCovered}
                onChange={(e) => setEditContractEmployeesCovered(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md"
                placeholder="Description du contrat..."
                value={editContractDescription}
                onChange={(e) => setEditContractDescription(e.target.value)}
              />
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
              onClick={handleUpdateContract}
              disabled={updateContract.isPending}
            >
              {updateContract.isPending ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de suppression */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le contrat</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le contrat{" "}
              <strong>{deletingContractNumero}</strong> ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteContract}
              disabled={deleteContract.isPending}
            >
              {deleteContract.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractsDashboard;
