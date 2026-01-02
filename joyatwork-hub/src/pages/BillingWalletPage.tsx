import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useWalletByEntreprise,
  useWalletStats,
  useWalletTransactions,
  useInvoices,
  useCreateRechargeInvoice,
  useMarkInvoicePaid,
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
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Wallet, Plus, CheckCircle2, Loader2, Building2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const BillingWalletPage = () => {
  const navigate = useNavigate();
  const [entrepriseId, setEntrepriseId] = useState<number | undefined>(
    undefined
  );
  const [selectedCompany, setSelectedCompany] = useState<{ id: number; name: string } | null>(null);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // Recherche d'entreprises
  const { data: companies, isLoading: isLoadingCompanies } = useCompanies({
    search: companySearchTerm || undefined,
  });

  // Formulaire de création de facture
  const [montantHt, setMontantHt] = useState<string>("");
  const [tauxTva, setTauxTva] = useState<string>("20");
  const [dueDate, setDueDate] = useState<string>("");

  // Mettre à jour l'entrepriseId quand une entreprise est sélectionnée
  useEffect(() => {
    if (selectedCompany) {
      setEntrepriseId(selectedCompany.id);
    }
  }, [selectedCompany]);

  // Hooks de lecture
  const { data: wallet } = useWalletByEntreprise(entrepriseId);
  const { data: walletStats } = useWalletStats(wallet?.id);
  const { data: transactions } = useWalletTransactions(wallet?.id);
  const { data: invoices } = useInvoices(
    entrepriseId
      ? { entreprise_id: entrepriseId, type: "recharge" }
      : undefined
  );

  // Hooks de mutation
  const createInvoice = useCreateRechargeInvoice();
  const markPaid = useMarkInvoicePaid();

  // Handler pour créer une facture de recharge
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entrepriseId || !selectedCompany) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une entreprise",
        variant: "destructive",
      });
      return;
    }

    const montant = parseFloat(montantHt);
    if (isNaN(montant) || montant <= 0) {
      toast({
        title: "Erreur",
        description: "Le montant HT doit être un nombre positif",
        variant: "destructive",
      });
      return;
    }

    try {
      await createInvoice.mutateAsync({
        entreprise_id: entrepriseId,
        montant_ht: montant,
        taux_tva: tauxTva ? parseFloat(tauxTva) : undefined,
        due_date: dueDate || undefined,
      });

      toast({
        title: "Succès",
        description: "Facture de recharge créée avec succès",
      });

      // Réinitialiser le formulaire
      setMontantHt("");
      setTauxTva("20");
      setDueDate("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de la facture",
        variant: "destructive",
      });
    }
  };

  // Handler pour marquer une facture comme payée
  const handleMarkPaid = async (invoiceId: number) => {
    try {
      await markPaid.mutateAsync(invoiceId);
      toast({
        title: "Succès",
        description: "Facture marquée comme payée",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du marquage de la facture",
        variant: "destructive",
      });
    }
  };

  // Calculer le TTC
  const calculateTtc = (ht: number, tva: number) => {
    return ht * (1 + tva / 100);
  };

  // Formater une date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Section 1: En-tête */}
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
            <h1 className="text-2xl font-bold">Gestion Wallet & Recharges</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les wallets des entreprises et les factures de recharge
            </p>
          </div>
        </div>
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
                    {isLoadingCompanies
                      ? "Chargement..."
                      : "Aucune entreprise trouvée."}
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
                setEntrepriseId(undefined);
              }}
            >
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Section 2: Résumé du wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Résumé du Wallet
            {selectedCompany && (
              <span className="text-base font-normal text-muted-foreground">
                - {selectedCompany.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {wallet ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Solde actuel</div>
                  <div className="text-2xl font-bold">
                    {wallet.balance} {wallet.devise}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Statut</div>
                  <div className="text-lg">
                    <Badge variant={wallet.is_locked ? "destructive" : "default"}>
                      {wallet.is_locked ? "Verrouillé" : "Actif"}
                    </Badge>
                  </div>
                </div>
                {walletStats && (
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Crédits restants
                    </div>
                    <div className="text-2xl font-bold">
                      {walletStats.credits_restants}
                    </div>
                  </div>
                )}
              </div>
              {walletStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total crédité
                    </div>
                    <div className="text-lg font-semibold text-green-600">
                      +{walletStats.total_credit} {wallet.devise}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Total débité
                    </div>
                    <div className="text-lg font-semibold text-red-600">
                      -{walletStats.total_debit} {wallet.devise}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedCompany
                ? "Aucun wallet trouvé pour cette entreprise"
                : "Sélectionnez une entreprise pour voir le wallet"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Formulaire de création de facture de recharge */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Créer une facture de recharge
          </CardTitle>
          <CardDescription>
            Créez une nouvelle facture de recharge pour créditer le wallet de
            l'entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant-ht">
                  Montant HT (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="montant-ht"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 1000"
                  value={montantHt}
                  onChange={(e) => setMontantHt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taux-tva">Taux TVA (%)</Label>
                <Input
                  id="taux-tva"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="20"
                  value={tauxTva}
                  onChange={(e) => setTauxTva(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Date d'échéance</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            {montantHt && tauxTva && (
              <div className="text-sm text-muted-foreground">
                Montant TTC :{" "}
                <span className="font-semibold">
                  {calculateTtc(
                    parseFloat(montantHt) || 0,
                    parseFloat(tauxTva) || 0
                  ).toFixed(2)}{" "}
                  €
                </span>
              </div>
            )}
            <Button
              type="submit"
              disabled={!entrepriseId || createInvoice.isPending}
            >
              {createInvoice.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la facture
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Section 4: Liste des factures de recharge */}
      <Card>
        <CardHeader>
          <CardTitle>Factures de recharge</CardTitle>
          <CardDescription>
            Liste des factures de recharge pour cette entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices?.data && invoices.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro facture</TableHead>
                  <TableHead>Date émission</TableHead>
                  <TableHead>Montant HT</TableHead>
                  <TableHead>Montant TTC</TableHead>
                  <TableHead>Date échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.data.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.numero_facture}
                    </TableCell>
                    <TableCell>{formatDate(invoice.date_emission)}</TableCell>
                    <TableCell>{invoice.montant_ht} €</TableCell>
                    <TableCell>{invoice.montant_ttc} €</TableCell>
                    <TableCell>{formatDate(invoice.due_date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          invoice.statut === "payee"
                            ? "default"
                            : invoice.statut === "envoyee"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {invoice.statut === "payee"
                          ? "Payée"
                          : invoice.statut === "envoyee"
                          ? "Envoyée"
                          : "À émettre"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.statut !== "payee" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkPaid(invoice.id)}
                          disabled={markPaid.isPending}
                        >
                          {markPaid.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Marquer payée
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
              {selectedCompany
                ? "Aucune facture de recharge pour cette entreprise"
                : "Sélectionnez une entreprise pour voir les factures"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Historique des transactions wallet */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
          <CardDescription>
            Tous les mouvements (crédits et débits) du wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions?.data && transactions.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Référence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.data.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDate(transaction.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === "credit"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {transaction.type === "credit" ? "Crédit" : "Débit"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={
                        transaction.type === "credit"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {transaction.type === "credit" ? "+" : "-"}
                      {transaction.amount} €
                    </TableCell>
                    <TableCell>{transaction.description || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.reference_type && transaction.reference_id
                        ? `${transaction.reference_type} #${transaction.reference_id}`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {wallet
                ? "Aucune transaction pour ce wallet"
                : "Sélectionnez une entreprise pour voir les transactions"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingWalletPage;

