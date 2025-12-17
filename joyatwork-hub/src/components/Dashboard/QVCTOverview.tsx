import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown,
  TrendingUp,
  Users,
  BarChart3,
  Download
} from "lucide-react";

export function QVCTOverview() {
  const qvctThemes = [
    {
      title: "ENGAGEMENT ORGANISATION",
      color: "bg-gradient-primary",
      items: [
        {
          name: "Management & Engagement",
          description: "Implication sur les sujets QVT",
          maturity: "avance",
          score: 85
        },
        {
          name: "Suivi RH", 
          description: "Qualité & Conditions de Vie au Travail",
          maturity: "medium",
          score: 72
        },
        {
          name: "Suivi Transverse QVT",
          description: "RH-RSE-CHSCT-Médecine du Travail",
          maturity: "avance",
          score: 88
        }
      ]
    },
    {
      title: "SALARIÉS _ TRAVAIL", 
      color: "bg-gradient-wellness",
      items: [
        {
          name: "Travail & son Environnement",
          description: "Qualité de travail",
          maturity: "medium",
          score: 78
        },
        {
          name: "Relation Hiérarchie & Collègues",
          description: "Cohésion d'équipe",
          maturity: "avance",
          score: 82
        },
        {
          name: "Salariés & Engagement au Travail",
          description: "Motivation et implication",
          maturity: "basic",
          score: 65
        }
      ]
    },
    {
      title: "MOYENS",
      color: "bg-gradient-energy", 
      items: [
        {
          name: "Dispositifs Qualité de Vie",
          description: "Santé & Bien-être",
          maturity: "avance",
          score: 90
        },
        {
          name: "Problématiques Santé & Bien-Être",
          description: "Répertorier tous les MAUX impactant la vie pro.",
          maturity: "medium",
          score: 74
        },
        {
          name: "Sensibilisation & Prévention",
          description: "santé & Bien-être",
          maturity: "avance-plus",
          score: 92
        }
      ]
    }
  ];

  const getMaturityBadge = (maturity: string) => {
    switch (maturity) {
      case "basic":
        return { label: "Basic", className: "bg-destructive text-white" };
      case "medium": 
        return { label: "Medium", className: "bg-warning text-white" };
      case "avance":
        return { label: "Avancé", className: "bg-success text-white" };
      case "avance-plus":
        return { label: "Avancé+", className: "bg-emerald-600 text-white" };
      default:
        return { label: "Basic", className: "bg-muted text-muted-foreground" };
    }
  };

  const alerts = [
    {
      type: "critical",
      message: "Pic de stress détecté dans l'équipe Marketing",
      count: 5,
      icon: AlertTriangle
    },
    {
      type: "warning",
      message: "Absentéisme en hausse (+12%)",
      count: 8,
      icon: TrendingUp
    },
    {
      type: "success",
      message: "Satisfaction employés en amélioration",
      count: 15,
      icon: CheckCircle2
    }
  ];

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">QVCT - Qualité de Vie au Travail</h3>
            <p className="text-muted-foreground">Suivi des conditions de travail</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* 3 Thématiques Clés QVCT */}
      <div className="space-y-6 mb-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">3 THÉMATIQUES CLÉS</h4>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded"></div>
              <span>Basic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-warning rounded"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-success rounded"></div>
              <span>Avancé</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-600 rounded"></div>
              <span>Avancé+</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {qvctThemes.map((theme, themeIndex) => (
            <Card key={themeIndex} className="border-0 shadow-soft overflow-hidden">
              <div className={`${theme.color} text-white p-4 text-center`}>
                <h5 className="font-bold text-sm">{theme.title}</h5>
              </div>
              
              <div className="p-4 space-y-4">
                {theme.items.map((item, itemIndex) => {
                  const maturityBadge = getMaturityBadge(item.maturity);
                  return (
                    <div key={itemIndex} className="space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h6 className="font-medium text-sm text-foreground leading-tight">{item.name}</h6>
                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          </div>
                          <Badge className={`${maturityBadge.className} text-xs px-2 py-1 shrink-0`}>
                            {maturityBadge.label}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Progress value={item.score} className="h-2 flex-1" />
                          <span className="text-sm font-semibold text-foreground min-w-[3rem]">{item.score}%</span>
                        </div>
                      </div>
                      
                      {itemIndex < theme.items.length - 1 && (
                        <div className="border-b border-border/50"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Alertes et signaux */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Alertes et signaux faibles</h4>
        </div>
        
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === "critical" ? "bg-destructive/5 border-destructive/20" :
                alert.type === "warning" ? "bg-warning/5 border-warning/20" :
                "bg-success/5 border-success/20"
              }`}>
                <Icon className={`w-5 h-5 ${
                  alert.type === "critical" ? "text-destructive" :
                  alert.type === "warning" ? "text-warning" : "text-success"
                }`} />
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{alert.message}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {alert.count}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}