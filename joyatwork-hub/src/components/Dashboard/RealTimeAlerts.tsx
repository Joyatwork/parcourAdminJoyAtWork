import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Users,
  Shield,
  Heart,
  Brain,
  ChevronRight,
  CheckCircle2,
  X,
  Eye
} from "lucide-react";

export function RealTimeAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: "critical",
      category: "Santé",
      title: "Pic de stress détecté",
      description: "Équipe commerciale - 15 personnes en stress élevé",
      impact: "Risque burnout dans 72h",
      department: "Commercial",
      count: 15,
      timestamp: "Il y a 5 min",
      action: "Intervention immédiate",
      cost: "45k€ si non traité",
      icon: Brain,
      color: "destructive",
      priority: 1
    },
    {
      id: 2,
      type: "warning",
      category: "Absentéisme",
      title: "Augmentation absentéisme",
      description: "Département IT - +25% cette semaine",
      impact: "Retard projet critique",
      department: "IT",
      count: 8,
      timestamp: "Il y a 12 min",
      action: "Analyse causes",
      cost: "23k€ de retard",
      icon: Users,
      color: "warning",
      priority: 2
    },
    {
      id: 3,
      type: "info",
      category: "Prévention",
      title: "Formation TMS recommandée",
      description: "Équipe logistique - 12 signalements douleurs",
      impact: "Prévention accidents",
      department: "Logistique",
      count: 12,
      timestamp: "Il y a 1h",
      action: "Planifier formation",
      cost: "Économie 67k€",
      icon: Shield,
      color: "primary",
      priority: 3
    },
    {
      id: 4,
      type: "success",
      category: "Amélioration",
      title: "Engagement en hausse",
      description: "Service client - Score +15% ce mois",
      impact: "Performance optimale",
      department: "Service client",
      count: 24,
      timestamp: "Il y a 2h",
      action: "Maintenir actions",
      cost: "+34k€ de valeur",
      icon: TrendingUp,
      color: "success",
      priority: 4
    }
  ]);

  const [viewedAlerts, setViewedAlerts] = useState<number[]>([]);

  const handleMarkAsViewed = (alertId: number) => {
    setViewedAlerts(prev => [...prev, alertId]);
  };

  const handleDismiss = (alertId: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "critical":
        return "border-destructive bg-destructive/5";
      case "warning":
        return "border-warning bg-warning/5";
      case "success":
        return "border-success bg-success/5";
      default:
        return "border-primary bg-primary/5";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "destructive":
        return "text-destructive";
      case "warning":
        return "text-warning";
      case "success":
        return "text-success";
      default:
        return "text-primary";
    }
  };

  const criticalAlertsCount = alerts.filter(a => a.type === "critical").length;
  const warningAlertsCount = alerts.filter(a => a.type === "warning").length;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-primary" />
              {(criticalAlertsCount + warningAlertsCount) > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">Alertes temps réel</CardTitle>
              <p className="text-muted-foreground">Surveillance intelligente et préventive</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalAlertsCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="w-3 h-3" />
                {criticalAlertsCount} critique{criticalAlertsCount > 1 ? 's' : ''}
              </Badge>
            )}
            {warningAlertsCount > 0 && (
              <Badge variant="secondary" className="gap-1 bg-warning text-warning-foreground">
                <Clock className="w-3 h-3" />
                {warningAlertsCount} attention
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Résumé des métriques critiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{criticalAlertsCount}</div>
            <div className="text-sm text-muted-foreground">Alertes critiques</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{warningAlertsCount}</div>
            <div className="text-sm text-muted-foreground">Signaux faibles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {alerts.reduce((sum, alert) => {
                const cost = parseInt(alert.cost.replace(/[^\d]/g, ''));
                return sum + cost;
              }, 0).toLocaleString()}k€
            </div>
            <div className="text-sm text-muted-foreground">Impact financier</div>
          </div>
        </div>

        {/* Liste des alertes */}
        <div className="space-y-3">
          {alerts.sort((a, b) => a.priority - b.priority).map((alert) => {
            const Icon = alert.icon;
            const isViewed = viewedAlerts.includes(alert.id);
            
            return (
              <div 
                key={alert.id} 
                className={`p-4 border-l-4 rounded-lg transition-all ${getAlertStyles(alert.type)} ${
                  isViewed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full bg-background ${getIconColor(alert.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.department}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-foreground">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Impact: </span>
                          <span className="font-medium">{alert.impact}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Action: </span>
                          <span className="font-medium">{alert.action}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-xs text-muted-foreground">Personnes concernées</span>
                            <div className="font-semibold">{alert.count}</div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Coût estimé</span>
                            <div className={`font-semibold ${
                              alert.cost.startsWith('+') ? 'text-success' : 'text-destructive'
                            }`}>
                              {alert.cost}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-3">
                    {!isViewed && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMarkAsViewed(alert.id)}
                        className="gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Vu
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDismiss(alert.id)}
                      className="gap-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    
                    <Button 
                      variant={alert.type === "critical" ? "destructive" : "outline"} 
                      size="sm"
                      className="gap-1"
                    >
                      Action
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions rapides globales */}
        <div className="p-4 bg-gradient-primary text-white rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Actions recommandées</h4>
              <p className="text-sm text-blue-100">
                Intervention immédiate pour réduire les risques de 60%
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Plan d'urgence
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Rapport détaillé
              </Button>
            </div>
          </div>
        </div>

        {/* Prédictions et tendances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h5 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Tendances positives
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Stress équipe RH</span>
                <span className="text-success">-12%</span>
              </div>
              <div className="flex justify-between">
                <span>Satisfaction globale</span>
                <span className="text-success">+8%</span>
              </div>
              <div className="flex justify-between">
                <span>Engagement management</span>
                <span className="text-success">+15%</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h5 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-destructive" />
              Points de vigilance
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Turnover commercial</span>
                <span className="text-destructive">+18%</span>
              </div>
              <div className="flex justify-between">
                <span>Arrêts maladie IT</span>
                <span className="text-destructive">+25%</span>
              </div>
              <div className="flex justify-between">
                <span>Fatigue logistique</span>
                <span className="text-warning">+7%</span>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}