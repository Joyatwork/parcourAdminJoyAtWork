import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useWalletByEntreprise,
  useWalletTransactions,
  useWalletStats,
  useOrders,
  useCredits,
  useUsages,
  useInvoices,
  usePayouts,
} from "@/hooks/useBilling";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [entrepriseId, setEntrepriseId] = useState<number | undefined>(undefined);
  const [statutInvoice, setStatutInvoice] = useState<string | undefined>(undefined);
  const [statutUsage, setStatutUsage] = useState<string | undefined>(undefined);
  const [statutPayout, setStatutPayout] = useState<string | undefined>(undefined);

  const { data: wallet } = useWalletByEntreprise(entrepriseId);
  const { data: walletStats } = useWalletStats(wallet?.id);
  const { data: transactions } = useWalletTransactions(wallet?.id);
  const { data: orders } = useOrders(
    entrepriseId ? { entreprise_id: entrepriseId } : undefined
  );
  const { data: credits } = useCredits(
    entrepriseId ? { entreprise_id: entrepriseId } : undefined
  );
  const { data: usages } = useUsages(
    entrepriseId
      ? { entreprise_id: entrepriseId, statut: statutUsage }
      : { statut: statutUsage }
  );
  const { data: invoices } = useInvoices(
    entrepriseId
      ? { entreprise_id: entrepriseId, statut: statutInvoice }
      : { statut: statutInvoice }
  );
  const { data: payouts } = usePayouts(
    statutPayout ? { statut: statutPayout } : undefined
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">Billing & Wallet</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            ID entreprise :
          </span>
          <Input
            type="number"
            placeholder="ex: 1"
            className="w-32"
            value={entrepriseId ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setEntrepriseId(val ? Number(val) : undefined);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Statut facture :</span>
          <Input
            placeholder="a_emettre | envoyee | payee"
            className="w-48"
            value={statutInvoice ?? ""}
            onChange={(e) => setStatutInvoice(e.target.value || undefined)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Statut usage :</span>
          <Input
            placeholder="valide_auto | refuse"
            className="w-40"
            value={statutUsage ?? ""}
            onChange={(e) => setStatutUsage(e.target.value || undefined)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Statut payout :</span>
          <Input
            placeholder="calcule | paye"
            className="w-32"
            value={statutPayout ?? ""}
            onChange={(e) => setStatutPayout(e.target.value || undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/billing/wallet")}>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wallet ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Solde :{" "}
                  <span className="font-semibold">
                    {wallet.balance} {wallet.devise}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Verrouillé : {wallet.is_locked ? "Oui" : "Non"}
                </div>
                {walletStats && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      Total crédité :{" "}
                      <span className="font-semibold">{walletStats.total_credit}</span>
                    </div>
                    <div>
                      Total débité :{" "}
                      <span className="font-semibold">{walletStats.total_debit}</span>
                    </div>
                    <div>
                      Crédits restants (tous services) :{" "}
                      <span className="font-semibold">
                        {walletStats.credits_restants}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Renseigne un ID entreprise pour charger le wallet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Factures (invoices)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(invoices?.data ?? []).slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex justify-between">
                <span>{inv.numero_facture}</span>
                <span>
                  {inv.montant_ht} HT — {inv.statut}
                </span>
              </div>
            ))}
            {!invoices?.data?.length && (
              <div className="text-muted-foreground">Aucune facture</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payouts praticiens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(payouts?.data ?? []).slice(0, 5).map((p) => (
              <div key={p.id} className="flex justify-between">
                <span>
                  {p.practitioner_id ?? "N/A"} | {p.periode_debut} →{" "}
                  {p.periode_fin}
                </span>
                <span>
                  {p.montant_total_ht} HT — {p.statut}
                </span>
              </div>
            ))}
            {!payouts?.data?.length && (
              <div className="text-muted-foreground">Aucun payout</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/billing/orders")}>
        <CardHeader>
          <CardTitle>Commandes (Orders)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(orders?.data ?? []).slice(0, 10).map((o) => (
            <div key={o.id} className="flex justify-between border-b pb-1">
              <div>
                <div className="font-semibold">{o.numero_commande}</div>
                <div className="text-muted-foreground">
                  {o.date_commande} — {o.statut}
                </div>
              </div>
              <div className="text-right">
                <div>{o.montant_total_ht} HT</div>
                <div className="text-muted-foreground">
                  {o.lines?.length ?? 0} lignes
                </div>
              </div>
            </div>
          ))}
          {!orders?.data?.length && (
            <div className="text-muted-foreground">Aucune commande</div>
          )}
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/billing/credits")}>
        <CardHeader>
          <CardTitle>Crédits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(credits?.data ?? []).slice(0, 10).map((c) => (
            <div key={c.id} className="flex justify-between border-b pb-1">
              <div>
                <div className="font-semibold">{c.type_service}</div>
                <div className="text-muted-foreground">
                  Expire : {c.date_expiration ?? "—"}
                </div>
              </div>
              <div className="text-right">
                <div>Restant : {c.quantite_restante}</div>
                <div className="text-muted-foreground">
                  Initial : {c.quantite_initiale}
                </div>
              </div>
            </div>
          ))}
          {!credits?.data?.length && (
            <div className="text-muted-foreground">Aucun crédit</div>
          )}
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/billing/usages")}>
        <CardHeader>
          <CardTitle>Usages (validés auto / refusés)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(usages?.data ?? [])
            .slice(0, 10)
            .map((u) => (
              <div key={u.id} className="flex justify-between border-b pb-1">
                <div>
                  <div className="font-semibold">{u.type_service}</div>
                  <div className="text-muted-foreground">
                    {u.date_prestation ?? "—"} — statut : {u.statut}
                  </div>
                </div>
                <div className="text-right">
                  <div>{u.prix_ht} HT</div>
                  <div className="text-muted-foreground">
                    Praticien : {u.practitioner_id ?? "N/A"}
                  </div>
                  <div className="flex gap-2 justify-end mt-1">
                    <Badge variant="outline">JAW {u.part_joyatwork_ht}</Badge>
                    <Badge variant="outline">Prat {u.part_praticien_ht}</Badge>
                  </div>
                </div>
              </div>
            ))}
          {!usages?.data?.length && (
            <div className="text-muted-foreground">Aucun usage</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(transactions?.data ?? []).slice(0, 10).map((t) => (
            <div key={t.id} className="flex justify-between border-b pb-1">
              <div>
                <div className="font-semibold">{t.type}</div>
                <div className="text-muted-foreground">{t.description}</div>
              </div>
              <div className="text-right">{t.amount}</div>
            </div>
          ))}
          {!transactions?.data?.length && (
            <div className="text-muted-foreground">Aucune transaction</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;

