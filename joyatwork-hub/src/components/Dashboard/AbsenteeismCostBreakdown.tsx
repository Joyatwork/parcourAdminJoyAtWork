import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { 
  Users, 
  TrendingDown, 
  BookOpen, 
  Clock,
  AlertCircle,
  Banknote
} from "lucide-react";

const costData = [
  { name: "Coûts de remplacement", value: 45, amount: 234500, color: "hsl(var(--primary))" },
  { name: "Perte de productivité", value: 35, amount: 182300, color: "hsl(var(--destructive))" },
  { name: "Coûts de formation", value: 12, amount: 62500, color: "hsl(var(--wellness))" },
  { name: "Surcharge équipes", value: 8, amount: 41700, color: "hsl(var(--warning))" }
];

const totalCost = costData.reduce((sum, item) => sum + item.amount, 0);

const impactMetrics = [
  {
    icon: Users,
    label: "Taux d'absentéisme",
    current: "7.2%",
    target: "4.5%",
    trend: "down",
    saving: "€125,000"
  },
  {
    icon: Clock,
    label: "Jours perdus/mois",
    current: "890",
    target: "560",
    trend: "down",
    saving: "€89,500"
  },
  {
    icon: TrendingDown,
    label: "Coût par absence",
    current: "€580",
    target: "€420",
    trend: "down",
    saving: "€45,200"
  }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground">{data.name}</p>
        <p className="text-primary font-bold">
          {data.value}% - €{data.amount.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function AbsenteeismCostBreakdown() {
  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Coûts d'Absentéisme
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Répartition détaillée et économies potentielles
            </p>
          </div>
          <div className="text-left sm:text-right">
            <Badge variant="destructive" className="mb-1">
              Coût Total
            </Badge>
            <p className="text-2xl font-bold text-destructive">
              €{totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">par an</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Cost Breakdown Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              Détail des Coûts
            </h3>
            {costData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {item.name}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">
                      €{item.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({item.value}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={item.value} 
                  className="h-2"
                  style={{
                    background: `${item.color}20`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-green-600" />
            Objectifs d'Amélioration & Économies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impactMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Actuel:</span>
                      <span className="text-sm font-bold text-destructive">
                        {metric.current}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Objectif:</span>
                      <span className="text-sm font-bold text-green-600">
                        {metric.target}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-green-700">
                          Économie annuelle:
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          {metric.saving}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Savings Potential */}
        <div className="mt-6 p-4 bg-gradient-primary text-white rounded-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h4 className="font-bold text-lg">Potentiel d'Économies Total</h4>
              <p className="text-blue-100 text-sm">
                Réduction ciblée de 30% de l'absentéisme
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold">€259,700</p>
              <p className="text-blue-100 text-sm">par an</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}