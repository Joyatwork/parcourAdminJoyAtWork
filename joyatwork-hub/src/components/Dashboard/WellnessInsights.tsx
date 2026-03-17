import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Trophy,
  ArrowRight,
  Star
} from "lucide-react";

export function WellnessInsights() {
  const insights = [
    {
      title: "Objectif du mois",
      description: "Réduire le stress de 15%",
      progress: 68,
      status: "En cours",
      color: "bg-gradient-primary",
      daysLeft: 12
    },
    {
      title: "Challenge équipe",
      description: "Pause déjeuner active",
      progress: 85,
      status: "Excellent",
      color: "bg-gradient-wellness",
      participants: 23
    }
  ];

  const recommendations = [
    {
      title: "Session méditation",
      description: "Votre stress a augmenté. Une méditation de 10 min pourrait aider.",
      priority: "high",
      icon: Lightbulb
    },
    {
      title: "Pause active",
      description: "Vous êtes assis depuis 2h. Que diriez-vous d'une courte marche ?",
      priority: "medium",
      icon: Target
    },
    {
      title: "Hydratation",
      description: "N'oubliez pas de boire de l'eau régulièrement aujourd'hui.",
      priority: "low",
      icon: Star
    }
  ];

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Bien-être</h3>
        <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
          <TrendingUp className="w-4 h-4" />
          Voir plus
        </Button>
      </div>

      {/* Objectifs en cours */}
      <div className="space-y-4 mb-6">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg text-white ${insight.color}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h4 className="font-semibold">{insight.title}</h4>
                <p className="text-sm opacity-90">{insight.description}</p>
              </div>
              <Trophy className="w-6 h-6 opacity-80" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression</span>
                <span className="font-medium">{insight.progress}%</span>
              </div>
              <Progress value={insight.progress} className="bg-white/20" />
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs opacity-90">
                <span>{insight.status}</span>
                <span>
                  {insight.daysLeft ? `${insight.daysLeft} jours restants` : `${insight.participants} participants`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommandations */}
      <div>
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Recommandations personnalisées
        </h4>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-gradient-to-r from-background to-muted/30 hover:shadow-soft transition-all group cursor-pointer min-w-0">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  rec.priority === "high" ? "bg-warning/10" :
                  rec.priority === "medium" ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Icon className={`w-4 h-4 ${
                    rec.priority === "high" ? "text-warning" :
                    rec.priority === "medium" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h5 className="font-medium text-foreground text-sm">{rec.title}</h5>
                    <Badge 
                      variant={rec.priority === "high" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {rec.priority === "high" ? "Urgent" : 
                       rec.priority === "medium" ? "Important" : "Info"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                </div>
                
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}