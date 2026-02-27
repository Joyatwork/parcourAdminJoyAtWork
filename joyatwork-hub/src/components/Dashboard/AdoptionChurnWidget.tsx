import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { adoptionChurnApi, CompanyUsage } from "@/lib/api";

type RiskLevel = "Low" | "Medium" | "High";

type ChurnData = {
  company: string;
  usage_rate: number;
  churn_risk: RiskLevel;
  satisfaction: number;
};

export function AdoptionChurnWidget() {
  const [data, setData] = useState<ChurnData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adoptionChurnApi
      .getAll()
      .then((apiData: CompanyUsage[]) => {
        const mapped: ChurnData[] = apiData.map((c) => ({
          company: String(c.company ?? c.company_name ?? "Inconnu"), // 🔹 forcer en string
          usage_rate: c.adoption_rate ?? 0,
          churn_risk:
            (c.risk_level.charAt(0).toUpperCase() +
              c.risk_level.slice(1).toLowerCase()) as RiskLevel,
          satisfaction: c.satisfaction_score ?? 0,
        }));

        setData(mapped);
      })
      .catch(() => setError("Erreur API"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card className="p-4">Chargement...</Card>;
  if (error) return <Card className="p-4 text-red-500">{error}</Card>;
  if (!data.length) return <Card className="p-4">Aucune donnée</Card>;

  const companiesAtRisk = data.filter(
    (c) => c.usage_rate < 50 || c.churn_risk === "High"
  );

  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Adoption & Churn</h3>

      {companiesAtRisk.length > 0 && (
        <div className="p-2 bg-red-100 text-red-700 rounded font-semibold">
          ⚠ {companiesAtRisk.length} entreprise(s) à risque
        </div>
      )}

      <ul className="space-y-4">
        {data.map((c, i) => {
          const rate = Math.round(c.usage_rate);

          const color =
            c.churn_risk === "High"
              ? "bg-red-500"
              : c.churn_risk === "Medium"
              ? "bg-yellow-400"
              : "bg-green-500";

          return (
            <li key={i} className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{c.company}</span>
                <span>
                  {rate}% — {c.churn_risk}
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Satisfaction : {c.satisfaction.toFixed(1)}
              </div>

              <div className="h-2 w-full bg-gray-200 rounded mt-1">
                <div
                  className={`h-2 rounded ${color}`}
                  style={{ width: `${rate}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}