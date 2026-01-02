import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsages, useCreateUsage } from "@/hooks/useBilling";
import { useCompanies } from "@/hooks/useCompanies";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Activity,
  Plus,
  Loader2,
  Building2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BillingUsagesPage = () => {
  const navigate = useNavigate();

  // États pour la sélection d'entreprise
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Filtres
  const [practitionerFilter, setPractitionerFilter] = useState<string>("");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  // Formulaire de création
  const [typeService, setTypeService] = useState<string>("");
  const [datePrestation, setDatePrestation] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [prixHt, setPrixHt] = useState<string>("");
  const [practitionerId, setPractitionerId] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [partJawPct, setPartJawPct] = useState<string>("30");
  const [partPratPct, setPartPratPct] = useState<string>("70");
  const [orderLineId, setOrderLineId] = useState<string>("");

  // Hooks de lecture
  const { data: companies, isLoading: companiesLoading } = useCompanies({
    search: companySearchTerm || undefined,
  });
  
  // Construire les filtres seulement s'ils ont une valeur
  const usageFilters: {
    entreprise_id?: number;
    practitioner_id?: number;
    statut?: string;
  } = {};
  
  if (selectedCompany?.id) {
    usageFilters.entreprise_id = selectedCompany.id;
  }
  if (practitionerFilter) {
    usageFilters.practitioner_id = Number(practitionerFilter);
  }
  if (statutFilter && statutFilter !== "all") {
    usageFilters.statut = statutFilter;
  }
  
  const { data: usages, isLoading: usagesLoading, error: usagesError } = useUsages(
    Object.keys(usageFilters).length > 0 ? usageFilters : undefined
  );

  // Hooks de mutation
  const createUsage = useCreateUsage();

  // Handler pour créer un usage
  const handleCreateUsage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive",
      });
      return;
    }

    if (!typeService.trim()) {
      toast({
        title: "Erreur",
        description: "Le type de service est requis",
        variant: "destructive",
      });
      return;
    }

    const prix = parseFloat(prixHt);
    if (isNaN(prix) || prix < 0) {
      toast({
        title: "Erreur",
        description: "Le prix HT doit être un nombre positif",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createUsage.mutateAsync({
        entreprise_id: selectedCompany.id,
        type_service: typeService.trim(),
        date_prestation: datePrestation,
        prix_ht: prix,
        practitioner_id: practitionerId ? Number(practitionerId) : undefined,
        employee_id: employeeId ? Number(employeeId) : undefined,
        part_joyatwork_pct: partJawPct ? parseFloat(partJawPct) : undefined,
        part_praticien_pct: partPratPct ? parseFloat(partPratPct) : undefined,
        order_line_id: orderLineId ? Number(orderLineId) : undefined,
      });

      toast({
        title: "Succès",
        description: `Usage créé avec statut : ${result.statut === "valide_auto" ? "Validé automatiquement" : "Refusé (pas de crédit disponible)"}`,
      });

      // Réinitialiser le formulaire
      setTypeService("");
      setDatePrestation(new Date().toISOString().split("T")[0]);
      setPrixHt("");
      setPractitionerId("");
      setEmployeeId("");
      setPartJawPct("30");
      setPartPratPct("70");
      setOrderLineId("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de l'usage",
        variant: "destructive",
      });
    }
  };

  // Formater une date avec protection supplémentaire
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("fr-FR");
    } catch {
      return "—";
    }
  };

  // Calculer les statistiques avec protection
  const stats = (() => {
    try {
      if (usages?.data && Array.isArray(usages.data) && usages.data.length > 0) {
        return {
          total: usages.data.length,
          valides: usages.data.filter((u) => u?.statut === "valide_auto").length,
          refuses: usages.data.filter((u) => u?.statut === "refuse").length,
          totalMontant: usages.data.reduce((sum, u) => sum + (Number(u?.prix_ht) || 0), 0),
          totalPartJaw: usages.data.reduce(
            (sum, u) => sum + (Number(u?.part_joyatwork_ht) || 0),
            0
          ),
          totalPartPrat: usages.data.reduce(
            (sum, u) => sum + (Number(u?.part_praticien_ht) || 0),
            0
          ),
        };
      }
      return null;
    } catch (error) {
      console.error("Erreur lors du calcul des statistiques:", error);
      return null;
    }
  })();

  return (
    <div className="p-6 space-y-6">
      {/* Section 1: En-tête et filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/billing")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestion des Usages</h1>
            <p className="text-sm text-muted-foreground">
              Consultez et créez des usages (prestations consommées). La
              validation est automatique si un crédit est disponible.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="entreprise-search" className="text-sm">
              Entreprise :
            </Label>
            <Popover
              open={companySearchOpen}
              onOpenChange={setCompanySearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companySearchOpen}
                  className="w-[300px] justify-between"
                >
                  {selectedCompany ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">{selectedCompany.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Rechercher une entreprise...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Rechercher une entreprise..."
                    value={companySearchTerm}
                    onValueChange={setCompanySearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>Aucune entreprise trouvée.</CommandEmpty>
                    <CommandGroup>
                      {companies && Array.isArray(companies) && companies.map((company) => (
                        <CommandItem
                          key={company.id}
                          value={company.name}
                          onSelect={() => {
                            setSelectedCompany({
                              id: company.id,
                              name: company.name,
                            });
                            setCompanySearchOpen(false);
                            setCompanySearchTerm("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCompany?.id === company.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <Building2 className="mr-2 h-4 w-4" />
                          {company.name}
                          {company.domain && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({company.domain})
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCompany && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCompany(null);
                }}
              >
                Effacer
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="practitioner-filter" className="text-sm">
              Praticien ID :
            </Label>
            <Input
              id="practitioner-filter"
              type="number"
              placeholder="ex: 1"
              className="w-32"
              value={practitionerFilter}
              onChange={(e) => setPractitionerFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="statut-filter" className="text-sm">
              Statut :
            </Label>
            <Select
              value={statutFilter}
              onValueChange={(value) => {
                setStatutFilter(value);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="valide_auto">Validé auto</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 2: Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total usages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Validés auto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.valides}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Refusés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.refuses}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Montant total HT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalMontant.toFixed(2)} €
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 3: Formulaire de création d'usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer un usage (en cas de problème)
          </CardTitle>
          <CardDescription>
            Créez un usage manuellement. La validation est automatique si un
            crédit est disponible pour ce type de service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUsage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type-service">
                  Type service <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="type-service"
                  placeholder="ex: seance_psy"
                  value={typeService}
                  onChange={(e) => setTypeService(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-prestation">
                  Date prestation <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date-prestation"
                  type="date"
                  value={datePrestation}
                  onChange={(e) => setDatePrestation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix-ht">
                  Prix HT (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prix-ht"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 100"
                  value={prixHt}
                  onChange={(e) => setPrixHt(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="practitioner-id">Praticien ID</Label>
                <Input
                  id="practitioner-id"
                  type="number"
                  placeholder="ex: 1"
                  value={practitionerId}
                  onChange={(e) => setPractitionerId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-id">Salarié ID</Label>
                <Input
                  id="employee-id"
                  type="number"
                  placeholder="ex: 1"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="part-jaw">Part JAW (%)</Label>
                <Input
                  id="part-jaw"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="30"
                  value={partJawPct}
                  onChange={(e) => setPartJawPct(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="part-prat">Part Praticien (%)</Label>
                <Input
                  id="part-prat"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="70"
                  value={partPratPct}
                  onChange={(e) => setPartPratPct(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-line-id">Order Line ID (optionnel)</Label>
                <Input
                  id="order-line-id"
                  type="number"
                  placeholder="Pour récupérer les parts automatiquement"
                  value={orderLineId}
                  onChange={(e) => setOrderLineId(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!selectedCompany || createUsage.isPending}
            >
              {createUsage.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer l'usage
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 4: Liste des usages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Liste des usages
          </CardTitle>
          <CardDescription>
            Historique des prestations consommées
            {selectedCompany && ` pour ${selectedCompany.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usagesLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des usages...
            </div>
          ) : usagesError ? (
            <div className="text-center py-8 text-red-500">
              Erreur lors du chargement des usages
            </div>
          ) : usages?.data && Array.isArray(usages.data) && usages.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date prestation</TableHead>
                  <TableHead>Type service</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Praticien</TableHead>
                  <TableHead>Salarié</TableHead>
                  <TableHead>Prix HT</TableHead>
                  <TableHead>Part JAW</TableHead>
                  <TableHead>Part Praticien</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(usages.data || []).map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>{formatDate(usage.date_prestation)}</TableCell>
                    <TableCell className="font-medium">
                      {usage.type_service || "—"}
                    </TableCell>
                    <TableCell>
                      {selectedCompany?.name || `ID: ${usage.entreprise_id || "—"}`}
                    </TableCell>
                    <TableCell>
                      {usage.practitioner_id ?? "—"}
                    </TableCell>
                    <TableCell>{usage.employee_id ?? "—"}</TableCell>
                    <TableCell>{usage.prix_ht ?? 0} €</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {usage.part_joyatwork_ht ?? 0} €
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {usage.part_praticien_ht ?? 0} €
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          usage.statut === "valide_auto"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {usage.statut === "valide_auto"
                          ? "Validé auto"
                          : usage.statut === "refuse"
                          ? "Refusé"
                          : usage.statut || "—"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedCompany || practitionerFilter || statutFilter !== "all"
                ? "Aucun usage trouvé avec ces filtres"
                : "Sélectionnez une entreprise ou appliquez des filtres pour voir les usages"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingUsagesPage;

