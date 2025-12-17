import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const performanceData = [
  { month: "Jan", performance: 78, engagement: 82, desengagement: 18 },
  { month: "Fév", performance: 72, engagement: 75, desengagement: 25 },
  { month: "Mar", performance: 69, engagement: 71, desengagement: 29 },
  { month: "Avr", performance: 65, engagement: 68, desengagement: 32 },
  { month: "Mai", performance: 71, engagement: 74, desengagement: 26 },
  { month: "Jun", performance: 76, engagement: 79, desengagement: 21 },
  { month: "Jul", performance: 81, engagement: 84, desengagement: 16 },
  { month: "Aoû", performance: 85, engagement: 87, desengagement: 13 },
  { month: "Sep", performance: 83, engagement: 86, desengagement: 14 },
  { month: "Oct", performance: 87, engagement: 89, desengagement: 11 },
  { month: "Nov", performance: 84, engagement: 88, desengagement: 12 },
  { month: "Déc", performance: 89, engagement: 91, desengagement: 9 }
];

const insights = [
  {
    type: "positive",
    icon: TrendingUp,
    title: "Corrélation forte Performance-Engagement",
    value: "+0.94",
    description: "Coefficient de corrélation excellent"
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "Point d'inflexion critique",
    value: "Avril",
    description: "Pic de désengagement détecté"
  },
  {
    type: "positive",
    icon: TrendingUp,
    title: "Amélioration Q4",
    value: "+23%",
    description: "Performance vs désengagement"
  }
];

export function PerformanceEngagementChart() {
  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Performance vs Engagement
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Analyse de corrélation et points d'inflexion critiques
            </p>
          </div>
          <Badge variant="secondary" className="bg-gradient-primary text-white">
            Outil Stratégique
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-sm text-muted-foreground"
              />
              <YAxis 
                className="text-sm text-muted-foreground"
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="performance"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Performance (%)"
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="hsl(var(--wellness))"
                strokeWidth={3}
                name="Engagement (%)"
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="desengagement"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Désengagement (%)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'positive' 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                    : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${
                    insight.type === 'positive' ? 'text-green-600' : 'text-orange-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {insight.title}
                    </p>
                    <p className={`text-lg font-bold ${
                      insight.type === 'positive' ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {insight.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}