import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Battery, Calendar, CheckCircle2, AlertCircle, AlertTriangle, Smile, Moon, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";

const metricConfigs = {
  'Stress': { icon: Brain, displayName: 'Stress' },
  'Énergie': { icon: Battery, displayName: 'Énergie' },
};

const months = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' }
];

const years = [2023, 2024, 2025, 2026];

export function HealthMetrics() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11);

  const fetchHealthData = async (year, month) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://localhost:8001/api/kpi-company-health/global-health?year=${year}&month=${month}`
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (data.length === 0) {
        setHealthData([]);
        setError(`Aucune donnée disponible pour ${months.find(m => m.value === month)?.label || month}/${year}`);
      } else {
        // Map only Stress and Énergie
        const formattedData = [
          {
            category: 'Stress',
            value: data[0].moyen_stress,
            status: data[0].moyen_stress > 6 ? 'warning' : data[0].moyen_stress > 4 ? 'medium' : 'good',
            icon: Brain,
          },
          {
            category: 'Énergie',
            value: data[0].moyen_energie,
            status: data[0].moyen_energie < 4 ? 'warning' : data[0].moyen_energie < 6 ? 'medium' : 'good',
            icon: Battery,
          },
          {
            category: 'Humeur',
            value: data[0].moyen_mood,
            status: data[0].moyen_mood < 4 ? 'warning' : data[0].moyen_mood < 6 ? 'medium' : 'good',
            icon: Smile,
          },
          {
            category: 'Sommeil',
            value: data[0].moyen_sommeil,
            status: data[0].moyen_sommeil < 4 ? 'warning' : data[0].moyen_sommeil < 6 ? 'medium' : 'good',
            icon: Moon,
          },
        ];

        setHealthData(formattedData);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données");
      setHealthData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const handleFilterChange = () => {
    fetchHealthData(selectedYear, selectedMonth);
  };

  const getBadge = (status) => {
    switch(status) {
      case 'good': return { icon: CheckCircle2, text: 'Bon', className: 'bg-green-100 text-green-800' };
      case 'medium': return { icon: AlertCircle, text: 'Moyen', className: 'bg-yellow-100 text-yellow-800' };
      case 'warning': return { icon: AlertTriangle, text: 'Attention', className: 'bg-red-100 text-red-800' };
      default: return { icon: AlertCircle, text: 'Moyen', className: 'bg-gray-100 text-gray-700' };
    }
  };

  const getProgressColor = (status) => {
  switch(status) {
    case 'good': 
      return 'bg-emerald-400';    // Un vert plus doux
    case 'medium': 
      return 'bg-yellow-200';     // Orange clair (pêche)
    case 'warning': 
      return 'bg-red-200';        // Rouge clair (corail/rose)
    default: 
      return 'bg-blue-300';
  }
};

  if (loading) return <Card className="p-6 text-center">Chargement...</Card>;

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Santé & Diagnostic</h3>
          <p className="text-muted-foreground">Suivi des indicateurs globaux</p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          <Button onClick={handleFilterChange} variant="outline" size="sm" className="gap-2">
            <Calendar className="w-4 h-4" /> Appliquer
          </Button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthData.map(metric => {
          const BadgeConfig = getBadge(metric.status);
          const Icon = metric.icon;
          return (
            <div key={metric.category} className="flex items-center gap-4 p-4 rounded-lg border bg-white">
              <div className={`p-3 rounded-full ${metric.status === 'good' ? 'bg-green-100' : metric.status === 'medium' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                <Icon className={`w-6 h-6 ${metric.status === 'good' ? 'text-green-500' : metric.status === 'medium' ? 'text-yellow-500' : 'text-red-500'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{metric.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{metric.value}</span>
                    <Badge className={`text-xs border ${BadgeConfig.className}`}>
                      <BadgeConfig.icon className="w-3 h-3 mr-1" />
                      {BadgeConfig.text}
                    </Badge>
                  </div>
                </div>

                <Progress value={metric.value * 10} className={getProgressColor(metric.status)} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
