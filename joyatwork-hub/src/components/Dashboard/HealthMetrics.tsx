import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Battery, 
  Moon, 
  AlertTriangle,
  CheckCircle2,
  Play,
  Users,
  Smile,
  Activity,
  Dumbbell,
  AlertCircle,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";

// Configuration des métriques
const metricConfigs = {
  'Stress': { icon: Brain, displayName: 'Stress' },
  'Énergie': { icon: Battery, displayName: 'Énergie' },
  'Sommeil': { icon: Moon, displayName: 'Sommeil' },
  'Forme physique': { icon: Dumbbell, displayName: 'Forme physique' },
  'TMS Score': { icon: Activity, displayName: 'TMS Score' },
  'Satisfaction': { icon: Smile, displayName: 'Satisfaction' },
  'Social': { icon: Users, displayName: 'Social' }
};

// Options pour les filtres
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
  const [infoMessage, setInfoMessage] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedMonth, setSelectedMonth] = useState(11);

  // Fonction pour récupérer les données
  const fetchHealthData = async (year, month) => {
    try {
      setLoading(true);
      setError(null);
      setInfoMessage(null);
      
      const response = await fetch(
        `http://localhost:8001/api/kpi-company-health/global-metrics?year=${year}&month=${month}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === "success") {
        if (data.data.length === 0) {
          setInfoMessage(data.message || `Aucune donnée disponible pour ${months.find(m => m.value === month)?.label || month}/${year}`);
          setHealthData([]);
        } else {
          const formattedData = data.data.map(metric => {
            const config = metricConfigs[metric.category];
            if (!config) return null;
            
            // Déterminer la couleur selon le statut
            const getColor = (status) => {
              switch(status) {
                case 'good': return { text: 'text-green-500', bg: 'bg-green-500/10' };
                case 'medium': return { text: 'text-yellow-500', bg: 'bg-yellow-500/10' };
                case 'warning': return { text: 'text-red-500', bg: 'bg-red-500/10' };
                default: return { text: 'text-gray-500', bg: 'bg-gray-500/10' };
              }
            };
            
            const colors = getColor(metric.status);
            
            return {
              category: config.displayName,
              value: metric.value,
              status: metric.status,
              icon: config.icon,
              color: colors.text,
              bgColor: colors.bg
            };
          }).filter(Boolean);
          
          setHealthData(formattedData);
        }
      } else {
        setError("Échec de la récupération des données");
        setHealthData([]);
      }
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger les données");
      setHealthData([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    fetchHealthData(selectedYear, selectedMonth);
  }, []);

  // Gérer le changement de filtre
  const handleFilterChange = () => {
    fetchHealthData(selectedYear, selectedMonth);
  };

  // Obtenir le badge selon le statut
  const getStatusBadge = (status) => {
    switch(status) {
      case 'good': return { icon: CheckCircle2, text: 'Bon', className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' };
      case 'medium': return { icon: AlertCircle, text: 'Moyen', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200' };
      case 'warning': return { icon: AlertTriangle, text: 'Attention', className: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200' };
      default: return { icon: AlertCircle, text: 'Moyen', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200' };
    }
  };

  // Fonction pour obtenir la classe de couleur de la barre de progression
  const getProgressColor = (status) => {
    switch(status) {
      case 'good': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'warning': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </Card>
    );
  }

  const monthName = months.find(m => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Santé & Diagnostic</h3>
          <p className="text-muted-foreground">Suivi des indicateurs de santé</p>
        </div>
        
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Année:</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded px-3 py-1 text-sm bg-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Mois:</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border rounded px-3 py-1 text-sm bg-white"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={handleFilterChange}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Appliquer
          </Button>
          
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="w-4 h-4" />
            Diagnostic
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {infoMessage && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <p>{infoMessage}</p>
          </div>
        </div>
      )}

      {healthData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {healthData.map((metric) => {
              const Icon = metric.icon;
              const badgeConfig = getStatusBadge(metric.status);
              const BadgeIcon = badgeConfig.icon;
              const progressColor = getProgressColor(metric.status);
              
              return (
                <div 
                  key={metric.category} 
                  className="flex items-center gap-4 p-4 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                >
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {metric.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{metric.value}%</span>
                        <Badge 
                          className={`text-xs border ${badgeConfig.className}`}
                        >
                          <BadgeIcon className="w-3 h-3 mr-1" />
                          {badgeConfig.text}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Barre de progression personnalisée */}
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full rounded-full ${progressColor}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Recommandation</h4>
              <p className="text-sm text-blue-700">
                {(() => {
                  const hasWarning = healthData.some(m => m.status === 'warning');
                  const hasMedium = healthData.some(m => m.status === 'medium');
                  
                  if (hasWarning) {
                    return "Risque : Des indicateurs nécessitent une attention immédiate.";
                  } else if (hasMedium) {
                    return "Moyen : Certains indicateurs pourraient être améliorés.";
                  } else {
                    return "Bon : Tous vos indicateurs sont satisfaisants.";
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
        </>
      ) : !infoMessage && !error && (
        <div className="py-12 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h4 className="text-lg font-medium text-gray-500 mb-2">Aucune donnée disponible</h4>
          <p className="text-gray-400 mb-4">Sélectionnez une autre période ou contactez l'administrateur</p>
        </div>
      )}
    </Card>
  );
}