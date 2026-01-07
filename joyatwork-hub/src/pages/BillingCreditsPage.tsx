import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/useBilling";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Check,
  ChevronsUpDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BillingCreditsPage = () => {
  const navigate = useNavigate();

  // États pour la sélection d'entreprise
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Filtres
  const [typeServiceFilter, setTypeServiceFilter] = useState<string>("");
  const [actifsOnly, setActifsOnly] = useState<boolean>(false);

  // Hooks de lecture
  const { data: companies } = useCompanies({
    search: companySearchTerm || undefined,
  });
  const { data: credits } = useCredits({
    entreprise_id: selectedCompany?.id,
    type_service: typeServiceFilter || undefined,
    actifs: actifsOnly || undefined,
  });

  // Fonctions utilitaires
  const calculateUsagePercent = (initiale: number, restante: number) => {
    if (initiale === 0) return 0;
    return Math.round(((initiale - restante) / initiale) * 100);
  };

  const isExpired = (dateExpiration: string | null) => {
    if (!dateExpiration) return false;
    return new Date(dateExpiration) < new Date();
  };

  const getCreditStatus = (credit: {
    quantite_restante: number;
    date_expiration: string | null;
  }) => {
    if (isExpired(credit.date_expiration)) return "expired";
    if (credit.quantite_restante === 0) return "exhausted";
    return "active";
  };

  // Calculer les statistiques
  const stats = credits?.data
    ? {
        total: credits.data.length,
        actifs: credits.data.filter((c) => c.quantite_restante > 0).length,
        epuises: credits.data.filter((c) => c.quantite_restante === 0).length,
        expires: credits.data.filter((c) =>
          isExpired(c.date_expiration)
        ).length,
        totalRestant: credits.data.reduce(
          (sum, c) => sum + c.quantite_restante,
          0
        ),
      }
    : null;

  // Formater une date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

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
            <h1 className="text-2xl font-bold">Gestion des Crédits</h1>
            <p className="text-sm text-muted-foreground">
              Consultez les crédits disponibles par entreprise et type de
              service
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
                      {companies?.map((company) => (
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
            <Label htmlFor="type-service" className="text-sm">
              Type service :
            </Label>
            <Input
              id="type-service"
              placeholder="ex: seance_psy"
              className="w-48"
              value={typeServiceFilter}
              onChange={(e) => setTypeServiceFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="actifs-only"
              checked={actifsOnly}
              onCheckedChange={(checked) => setActifsOnly(checked === true)}
            />
            <Label htmlFor="actifs-only" className="text-sm cursor-pointer">
              Actifs uniquement
            </Label>
          </div>
        </div>
      </div>

      {/* Section 2: Résumé des crédits */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total crédits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crédits actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.actifs}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crédits épuisés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.epuises}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quantité totale restante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestant}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Section 3: Liste des crédits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Liste des crédits
          </CardTitle>
          <CardDescription>
            Crédits disponibles par entreprise et type de service
            {selectedCompany && ` pour ${selectedCompany.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {credits?.data && credits.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type de service</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Quantité initiale</TableHead>
                  <TableHead>Quantité restante</TableHead>
                  <TableHead>Utilisation</TableHead>
                  <TableHead>Date expiration</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credits.data.map((credit) => {
                  const usagePercent = calculateUsagePercent(
                    credit.quantite_initiale,
                    credit.quantite_restante
                  );
                  const status = getCreditStatus(credit);

                  return (
                    <TableRow key={credit.id}>
                      <TableCell className="font-medium">
                        {credit.type_service}
                      </TableCell>
                      <TableCell>
                        {selectedCompany?.name || `ID: ${credit.entreprise_id}`}
                      </TableCell>
                      <TableCell>{credit.quantite_initiale}</TableCell>
                      <TableCell className="font-semibold">
                        {credit.quantite_restante}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 w-32">
                          <Progress value={usagePercent} className="h-2" />
                          <span className="text-xs text-muted-foreground min-w-[3rem]">
                            {usagePercent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(credit.date_expiration)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "active"
                              ? "default"
                              : status === "exhausted"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {status === "active"
                            ? "Actif"
                            : status === "exhausted"
                            ? "Épuisé"
                            : "Expiré"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedCompany || typeServiceFilter || actifsOnly
                ? "Aucun crédit trouvé avec ces filtres"
                : "Sélectionnez une entreprise ou appliquez des filtres pour voir les crédits"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingCreditsPage;

