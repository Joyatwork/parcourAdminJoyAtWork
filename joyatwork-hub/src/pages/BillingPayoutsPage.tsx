import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePayouts,
  useGeneratePayout,
  useMarkPayoutPaid,
  usePractitioners,
} from "@/hooks/useBilling";
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
  DollarSign,
  Plus,
  Loader2,
  User,
  Check,
  ChevronsUpDown,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BillingPayoutsPage = () => {
  const navigate = useNavigate();

  // États pour la sélection de praticien (filtres)
  const [selectedPractitioner, setSelectedPractitioner] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [practitionerSearchOpen, setPractitionerSearchOpen] = useState(false);
  const [practitionerSearchTerm, setPractitionerSearchTerm] = useState("");

  // Filtres
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [periodeDebut, setPeriodeDebut] = useState<string>("");
  const [periodeFin, setPeriodeFin] = useState<string>("");

  // Formulaire de génération
  const [selectedPractitionerForm, setSelectedPractitionerForm] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [practitionerSearchOpenForm, setPractitionerSearchOpenForm] =
    useState(false);
  const [practitionerSearchTermForm, setPractitionerSearchTermForm] =
    useState("");
  const [periodeDebutForm, setPeriodeDebutForm] = useState<string>("");
  const [periodeFinForm, setPeriodeFinForm] = useState<string>("");

  // Hooks de lecture
  const { data: practitioners } = usePractitioners(
    practitionerSearchTerm || undefined
  );
  const { data: practitionersForm } = usePractitioners(
    practitionerSearchTermForm || undefined
  );

  // Construire les filtres
  const payoutFilters: {
    practitioner_id?: number;
    statut?: string;
    periode_debut?: string;
    periode_fin?: string;
  } = {};

  if (selectedPractitioner?.id) {
    payoutFilters.practitioner_id = selectedPractitioner.id;
  }
  if (statutFilter && statutFilter !== "all") {
    payoutFilters.statut = statutFilter;
  }
  if (periodeDebut) {
    payoutFilters.periode_debut = periodeDebut;
  }
  if (periodeFin) {
    payoutFilters.periode_fin = periodeFin;
  }

  const {
    data: payouts,
    isLoading: payoutsLoading,
    error: payoutsError,
  } = usePayouts(
    Object.keys(payoutFilters).length > 0 ? payoutFilters : undefined
  );

  // Hooks de mutation
  const generatePayout = useGeneratePayout();
  const markPayoutPaid = useMarkPayoutPaid();

  // Handler pour générer un payout
  const handleGeneratePayout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPractitionerForm) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un praticien",
        variant: "destructive",
      });
      return;
    }

    if (!periodeDebutForm || !periodeFinForm) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner la période (début et fin)",
        variant: "destructive",
      });
      return;
    }

    if (new Date(periodeDebutForm) > new Date(periodeFinForm)) {
      toast({
        title: "Erreur",
        description: "La date de début doit être antérieure à la date de fin",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePayout.mutateAsync({
        practitioner_id: selectedPractitionerForm.id,
        periode_debut: periodeDebutForm,
        periode_fin: periodeFinForm,
      });

      toast({
        title: "Succès",
        description: "Payout généré avec succès",
      });

      // Réinitialiser le formulaire
      setSelectedPractitionerForm(null);
      setPeriodeDebutForm("");
      setPeriodeFinForm("");
      setPractitionerSearchTermForm("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération du payout",
        variant: "destructive",
      });
    }
  };

  // Handler pour marquer un payout comme payé
  const handleMarkPaid = async (payoutId: number) => {
    try {
      await markPayoutPaid.mutateAsync(payoutId);
      toast({
        title: "Succès",
        description: "Payout marqué comme payé",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du marquage",
        variant: "destructive",
      });
    }
  };

  // Formater une date
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

  // Obtenir le nom complet du praticien
  const getPractitionerName = (payout: any) => {
    if (payout.practitioner) {
      return `${payout.practitioner.first_name || ""} ${
        payout.practitioner.last_name || ""
      }`.trim();
    }
    return `ID: ${payout.practitioner_id || "—"}`;
  };

  // Calculer les statistiques
  const stats = (() => {
    try {
      if (
        payouts?.data &&
        Array.isArray(payouts.data) &&
        payouts.data.length > 0
      ) {
        return {
          total: payouts.data.length,
          calcules: payouts.data.filter((p) => p.statut === "calcule").length,
          payes: payouts.data.filter((p) => p.statut === "paye").length,
          totalAPayer: payouts.data
            .filter((p) => p.statut === "calcule")
            .reduce((sum, p) => sum + (Number(p.montant_total_ht) || 0), 0),
          totalPaye: payouts.data
            .filter((p) => p.statut === "paye")
            .reduce((sum, p) => sum + (Number(p.montant_total_ht) || 0), 0),
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
            <h1 className="text-2xl font-bold">
              Gestion des Payouts (Reversements Praticiens)
            </h1>
            <p className="text-sm text-muted-foreground">
              Générez et gérez les reversements aux praticiens basés sur les
              usages validés.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="practitioner-search" className="text-sm">
              Praticien :
            </Label>
            <Popover
              open={practitionerSearchOpen}
              onOpenChange={setPractitionerSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={practitionerSearchOpen}
                  className="w-[300px] justify-between"
                >
                  {selectedPractitioner ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="truncate">
                        {selectedPractitioner.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Rechercher un praticien...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Rechercher un praticien..."
                    value={practitionerSearchTerm}
                    onValueChange={setPractitionerSearchTerm}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun praticien trouvé.</CommandEmpty>
                    <CommandGroup>
                      {practitioners?.data &&
                        Array.isArray(practitioners.data) &&
                        practitioners.data.map((practitioner) => {
                          const fullName = `${practitioner.first_name || ""} ${
                            practitioner.last_name || ""
                          }`.trim();
                          return (
                            <CommandItem
                              key={practitioner.id}
                              value={fullName}
                              onSelect={() => {
                                setSelectedPractitioner({
                                  id: practitioner.id,
                                  name: fullName,
                                });
                                setPractitionerSearchOpen(false);
                                setPractitionerSearchTerm("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedPractitioner?.id === practitioner.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <User className="mr-2 h-4 w-4" />
                              {fullName}
                              {practitioner.specialty && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({practitioner.specialty})
                                </span>
                              )}
                            </CommandItem>
                          );
                        })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedPractitioner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPractitioner(null);
                }}
              >
                Effacer
              </Button>
            )}
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
                <SelectItem value="calcule">Calculé</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="periode-debut" className="text-sm">
              Période début :
            </Label>
            <Input
              id="periode-debut"
              type="date"
              className="w-40"
              value={periodeDebut}
              onChange={(e) => setPeriodeDebut(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="periode-fin" className="text-sm">
              Période fin :
            </Label>
            <Input
              id="periode-fin"
              type="date"
              className="w-40"
              value={periodeFin}
              onChange={(e) => setPeriodeFin(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calculés (non payés)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.calcules}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.payes}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Montant à payer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalAPayer.toFixed(2)} €
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Montant payé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalPaye.toFixed(2)} €
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 3: Formulaire de génération de payout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Générer un payout
          </CardTitle>
          <CardDescription>
            Générez un payout pour un praticien sur une période donnée. Le
            système agrège automatiquement tous les usages validés.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGeneratePayout} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="practitioner-form">
                  Praticien <span className="text-red-500">*</span>
                </Label>
                <Popover
                  open={practitionerSearchOpenForm}
                  onOpenChange={setPractitionerSearchOpenForm}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={practitionerSearchOpenForm}
                      className="w-full justify-between"
                    >
                      {selectedPractitionerForm ? (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="truncate">
                            {selectedPractitionerForm.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Rechercher un praticien...
                        </span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Rechercher un praticien..."
                        value={practitionerSearchTermForm}
                        onValueChange={setPractitionerSearchTermForm}
                      />
                      <CommandList>
                        <CommandEmpty>Aucun praticien trouvé.</CommandEmpty>
                        <CommandGroup>
                          {practitionersForm?.data &&
                            Array.isArray(practitionersForm.data) &&
                            practitionersForm.data.map((practitioner) => {
                              const fullName = `${practitioner.first_name || ""} ${
                                practitioner.last_name || ""
                              }`.trim();
                              return (
                                <CommandItem
                                  key={practitioner.id}
                                  value={fullName}
                                  onSelect={() => {
                                    setSelectedPractitionerForm({
                                      id: practitioner.id,
                                      name: fullName,
                                    });
                                    setPractitionerSearchOpenForm(false);
                                    setPractitionerSearchTermForm("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedPractitionerForm?.id ===
                                        practitioner.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <User className="mr-2 h-4 w-4" />
                                  {fullName}
                                  {practitioner.specialty && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      ({practitioner.specialty})
                                    </span>
                                  )}
                                </CommandItem>
                              );
                            })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode-debut-form">
                  Période début <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="periode-debut-form"
                  type="date"
                  value={periodeDebutForm}
                  onChange={(e) => setPeriodeDebutForm(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode-fin-form">
                  Période fin <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="periode-fin-form"
                  type="date"
                  value={periodeFinForm}
                  onChange={(e) => setPeriodeFinForm(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!selectedPractitionerForm || generatePayout.isPending}
            >
              {generatePayout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Générer le payout
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 4: Liste des payouts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Liste des payouts
          </CardTitle>
          <CardDescription>
            Historique des reversements aux praticiens
            {selectedPractitioner && ` pour ${selectedPractitioner.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Chargement des payouts...
            </div>
          ) : payoutsError ? (
            <div className="text-center py-8 text-red-500">
              Erreur lors du chargement des payouts
            </div>
          ) : payouts?.data &&
            Array.isArray(payouts.data) &&
            payouts.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Praticien</TableHead>
                  <TableHead>Nombre usages</TableHead>
                  <TableHead>Montant total HT</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date paiement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payouts.data || []).map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {formatDate(payout.periode_debut)} →{" "}
                      {formatDate(payout.periode_fin)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getPractitionerName(payout)}
                    </TableCell>
                    <TableCell>{payout.nombre_usages || 0}</TableCell>
                    <TableCell>{payout.montant_total_ht || 0} €</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payout.statut === "paye" ? "default" : "secondary"
                        }
                      >
                        {payout.statut === "paye" ? "Payé" : "Calculé"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payout.paid_at
                        ? formatDate(payout.paid_at)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {payout.statut === "calcule" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={markPayoutPaid.isPending}
                        >
                          {markPayoutPaid.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Marquer payé
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedPractitioner ||
              statutFilter !== "all" ||
              periodeDebut ||
              periodeFin
                ? "Aucun payout trouvé avec ces filtres"
                : "Sélectionnez un praticien ou appliquez des filtres pour voir les payouts"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPayoutsPage;

