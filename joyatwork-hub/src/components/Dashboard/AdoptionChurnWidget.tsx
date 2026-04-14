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
          company: String(c.company ?? c.company_name ?? "Inconnu"),
          usage_rate: c.adoption_rate ?? 0,
          churn_risk:
            (c.risk_level.charAt(0).toUpperCase() +
              c.risk_level.slice(1).toLowerCase()) as RiskLevel,
          satisfaction: c.satisfaction_score ?? 0,
        }));

        // 🔥 tri : High → Medium → Low
        const sorted = mapped.sort((a, b) => {
          const order = { High: 3, Medium: 2, Low: 1 };
          return order[b.churn_risk] - order[a.churn_risk];
        });

        setData(sorted);
      })
      .catch(() => setError("Erreur API"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Card className="p-6">Chargement...</Card>;
  if (error) return <Card className="p-6 text-red-500">{error}</Card>;
  if (!data.length) return <Card className="p-6">Aucune donnée</Card>;

  const companiesAtRisk = data.filter(
    (c) => c.usage_rate < 50 || c.churn_risk === "High"
  );

  return (
    <Card className="p-6 rounded-2xl shadow-xl bg-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Adoption & Churn
        </h3>

        <div className="text-sm text-gray-500">
          {data.length} entreprises
        </div>
      </div>

      {/* KPI ALERT */}
      {companiesAtRisk.length > 0 && (
        <div className="mb-6 flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="text-red-700 font-medium">
            ⚠ {companiesAtRisk.length} entreprise(s) à risque
          </div>
          <span className="text-xs text-red-500">
            Surveillance recommandée
          </span>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-3">
        {data.map((c, i) => {
          const rate = Math.round(c.usage_rate);

          const barColor =
            c.churn_risk === "High"
              ? "bg-red-500"
              : c.churn_risk === "Medium"
              ? "bg-yellow-400"
              : "bg-green-500";

          const badgeColor =
            c.churn_risk === "High"
              ? "bg-red-100 text-red-600"
              : c.churn_risk === "Medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700";

          return (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
            >
              {/* LEFT */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-800">
                    {c.company}
                  </span>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}
                  >
                    {c.churn_risk}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  Satisfaction :{" "}
                  <span className="font-medium text-gray-700">
                    {c.satisfaction.toFixed(1)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${barColor} transition-all`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>

              {/* RIGHT */}
              <div className="ml-4 text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {rate}%
                </div>
                <div className="text-xs text-gray-500">
                  adoption
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}