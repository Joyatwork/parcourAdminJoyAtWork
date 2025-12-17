import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Brain, 
  Battery, 
  Moon, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Play
} from "lucide-react";

export function HealthMetrics() {
  const healthData = [
    {
      category: "Stress",
      value: 65,
      status: "warning",
      icon: Brain,
      color: "text-warning",
      bgColor: "bg-warning/10",
      trend: "+5%"
    },
    {
      category: "Énergie",
      value: 78,
      status: "good",
      icon: Battery,
      color: "text-success",
      bgColor: "bg-success/10",
      trend: "+12%"
    },
    {
      category: "Sommeil",
      value: 82,
      status: "good",
      icon: Moon,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+8%"
    },
    {
      category: "Forme physique",
      value: 71,
      status: "good",
      icon: Heart,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      trend: "+3%"
    }
  ];

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Métriques de santé</h3>
          <p className="text-muted-foreground">Suivi en temps réel de vos indicateurs</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Play className="w-4 h-4" />
          Auto-diagnostic
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {healthData.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.category} className="flex items-center gap-4 p-4 rounded-lg border bg-gradient-to-r from-background to-muted/50">
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <Icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{metric.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{metric.value}%</span>
                    <Badge variant={metric.status === "good" ? "secondary" : "destructive"} className="text-xs">
                      {metric.status === "good" ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {metric.status === "good" ? "Bon" : "Attention"}
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2 mb-2" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  {metric.trend} cette semaine
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-gradient-wellness rounded-lg text-white">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6" />
          <div>
            <h4 className="font-semibold">Recommandation intelligente</h4>
            <p className="text-sm text-green-100">
              Votre niveau de stress est élevé. Essayez une session de relaxation de 10 minutes.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}