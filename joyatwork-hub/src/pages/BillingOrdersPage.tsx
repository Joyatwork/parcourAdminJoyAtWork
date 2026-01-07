import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useOrders,
  useCreateOrder,
  useWalletByEntreprise,
} from "@/hooks/useBilling";
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
  ShoppingCart,
  Plus,
  Trash2,
  Loader2,
  Building2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderLineFormData {
  type_service: string;
  quantite: number;
  prix_unitaire_ht: number;
  part_joyatwork_pct: number;
  part_praticien_pct: number;
}

const BillingOrdersPage = () => {
  const navigate = useNavigate();

  // États pour la sélection d'entreprise
  const [selectedCompany, setSelectedCompany] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Filtres
  const [statutFilter, setStatutFilter] = useState<string>("all");

  // Formulaire
  const [dateCommande, setDateCommande] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [lignes, setLignes] = useState<OrderLineFormData[]>([
    {
      type_service: "",
      quantite: 1,
      prix_unitaire_ht: 0,
      part_joyatwork_pct: 30,
      part_praticien_pct: 70,
    },
  ]);

  // Hooks de lecture
  const { data: companies } = useCompanies({
    search: companySearchTerm || undefined,
  });
  const { data: wallet } = useWalletByEntreprise(selectedCompany?.id);
  const { data: orders } = useOrders({
    entreprise_id: selectedCompany?.id,
    statut: statutFilter === "all" ? undefined : statutFilter || undefined,
  });

  // Hooks de mutation
  const createOrder = useCreateOrder();

  // Mettre à jour l'entrepriseId quand une entreprise est sélectionnée
  useEffect(() => {
    if (selectedCompany) {
      // L'entreprise est déjà sélectionnée, pas besoin de mettre à jour entrepriseId
    }
  }, [selectedCompany]);

  // Handlers pour les lignes
  const handleAddLigne = () => {
    setLignes([
      ...lignes,
      {
        type_service: "",
        quantite: 1,
        prix_unitaire_ht: 0,
        part_joyatwork_pct: 30,
        part_praticien_pct: 70,
      },
    ]);
  };

  const handleRemoveLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Attention",
        description: "Une commande doit avoir au moins une ligne",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLigne = (
    index: number,
    field: keyof OrderLineFormData,
    value: string | number
  ) => {
    const newLignes = [...lignes];
    newLignes[index] = {
      ...newLignes[index],
      [field]: value,
    };
    setLignes(newLignes);
  };

  // Calcul du total HT
  const totalHT = lignes.reduce(
    (sum, ligne) => sum + ligne.quantite * ligne.prix_unitaire_ht,
    0
  );

  // Handler pour créer une commande
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCompany) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive",
      });
      return;
    }

    // Validation des lignes
    for (let i = 0; i < lignes.length; i++) {
      const ligne = lignes[i];
      if (!ligne.type_service.trim()) {
        toast({
          title: "Erreur",
          description: `La ligne ${i + 1} : type de service requis`,
          variant: "destructive",
        });
        return;
      }
      if (ligne.quantite <= 0) {
        toast({
          title: "Erreur",
          description: `La ligne ${i + 1} : quantité doit être > 0`,
          variant: "destructive",
        });
        return;
      }
      if (ligne.prix_unitaire_ht < 0) {
        toast({
          title: "Erreur",
          description: `La ligne ${i + 1} : prix unitaire doit être >= 0`,
          variant: "destructive",
        });
        return;
      }
    }

    // Vérifier le solde si wallet existe
    if (wallet && wallet.balance < totalHT) {
      toast({
        title: "Erreur",
        description: `Solde insuffisant. Solde disponible : ${wallet.balance} ${wallet.devise}, Montant commande : ${totalHT.toFixed(2)} €`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createOrder.mutateAsync({
        entreprise_id: selectedCompany.id,
        date_commande: dateCommande || undefined,
        lignes: lignes.map((l) => ({
          type_service: l.type_service.trim(),
          quantite: l.quantite,
          prix_unitaire_ht: l.prix_unitaire_ht,
          part_joyatwork_pct: l.part_joyatwork_pct,
          part_praticien_pct: l.part_praticien_pct,
        })),
      });

      toast({
        title: "Succès",
        description: "Commande créée avec succès. Le wallet a été débité et les crédits ont été générés.",
      });

      // Réinitialiser le formulaire
      setLignes([
        {
          type_service: "",
          quantite: 1,
          prix_unitaire_ht: 0,
          part_joyatwork_pct: 30,
          part_praticien_pct: 70,
        },
      ]);
      setDateCommande(new Date().toISOString().split("T")[0]);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message || "Erreur lors de la création de la commande",
        variant: "destructive",
      });
    }
  };

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
            <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
            <p className="text-sm text-muted-foreground">
              Créez des commandes (packs, campagnes) qui débitent le wallet et
              génèrent des crédits
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="entreprise-search" className="text-sm">
              Entreprise :
            </Label>
            <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
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
                    <CommandEmpty>
                      Aucune entreprise trouvée.
                    </CommandEmpty>
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
            <Label htmlFor="statut-filter" className="text-sm">
              Statut :
            </Label>
            <Select 
              value={statutFilter || "all"} 
              onValueChange={(value) => setStatutFilter(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Section 2: Formulaire de création de commande */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Créer une commande
          </CardTitle>
          <CardDescription>
            Créez une commande qui débitera le wallet et générera des crédits
            par type de service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-semibold">
                Solde disponible : {wallet.balance} {wallet.devise}
              </div>
            </div>
          )}
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-commande">Date de commande</Label>
                <Input
                  id="date-commande"
                  type="date"
                  value={dateCommande}
                  onChange={(e) => setDateCommande(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Lignes de commande</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLigne}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une ligne
                </Button>
              </div>

              <div className="space-y-4">
                {lignes.map((ligne, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label>
                          Type service <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="ex: seance_psy"
                          value={ligne.type_service}
                          onChange={(e) =>
                            handleUpdateLigne(
                              index,
                              "type_service",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Quantité <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={ligne.quantite}
                          onChange={(e) =>
                            handleUpdateLigne(
                              index,
                              "quantite",
                              parseInt(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          Prix unitaire HT (€){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ligne.prix_unitaire_ht}
                          onChange={(e) =>
                            handleUpdateLigne(
                              index,
                              "prix_unitaire_ht",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Part JAW (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={ligne.part_joyatwork_pct}
                          onChange={(e) =>
                            handleUpdateLigne(
                              index,
                              "part_joyatwork_pct",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Part Praticien (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={ligne.part_praticien_pct}
                          onChange={(e) =>
                            handleUpdateLigne(
                              index,
                              "part_praticien_pct",
                              parseFloat(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveLigne(index)}
                          disabled={lignes.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Montant ligne :{" "}
                      {(ligne.quantite * ligne.prix_unitaire_ht).toFixed(2)} €
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-lg font-semibold">
                Total HT : {totalHT.toFixed(2)} €
              </div>
              <Button
                type="submit"
                disabled={!selectedCompany || createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer la commande
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Section 3: Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            Historique des commandes créées
            {selectedCompany && ` pour ${selectedCompany.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders?.data && orders.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro commande</TableHead>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Date commande</TableHead>
                  <TableHead>Montant HT</TableHead>
                  <TableHead>Nb lignes</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.numero_commande}
                    </TableCell>
                    <TableCell>
                      {selectedCompany?.name || `ID: ${order.entreprise_id}`}
                    </TableCell>
                    <TableCell>{formatDate(order.date_commande)}</TableCell>
                    <TableCell>{order.montant_total_ht} €</TableCell>
                    <TableCell>
                      {order.lines?.length || 0} ligne
                      {(order.lines?.length || 0) > 1 ? "s" : ""}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.statut === "confirmed"
                            ? "default"
                            : order.statut === "cancelled"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {order.statut === "confirmed"
                          ? "Confirmée"
                          : order.statut === "cancelled"
                          ? "Annulée"
                          : order.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedCompany
                ? "Aucune commande pour cette entreprise"
                : "Sélectionnez une entreprise pour voir les commandes"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingOrdersPage;

