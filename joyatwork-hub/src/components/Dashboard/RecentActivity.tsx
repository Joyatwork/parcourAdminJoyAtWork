import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Calendar,
  FileText,
  Users
} from "lucide-react";

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "challenge",
      title: "Challenge 'Marche quotidienne' terminé",
      description: "7 jours consécutifs, 10 000 pas/jour",
      time: "Il y a 2h",
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: 2,
      type: "diagnostic",
      title: "Auto-diagnostic bien-être complété",
      description: "Score global: 82/100",
      time: "Hier",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      id: 3,
      type: "appointment",
      title: "RDV avec Dr. Martin confirmé",
      description: "Consultation générale - 14:30",
      time: "Il y a 1 jour",
      icon: Calendar,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      id: 4,
      type: "report",
      title: "Rapport QVCT généré",
      description: "Analyse mensuelle équipe",
      time: "Il y a 2 jours",
      icon: FileText,
      color: "text-muted-foreground",
      bgColor: "bg-muted"
    },
    {
      id: 5,
      type: "team",
      title: "Nouvelle recommandation d'équipe",
      description: "Session relaxation collective",
      time: "Il y a 3 jours",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Activité récente</h3>
        <Badge variant="secondary" className="w-fit bg-gradient-primary text-white">
          <TrendingUp className="w-3 h-3 mr-1" />
          Actif
        </Badge>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`p-2 rounded-full ${activity.bgColor} flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm mb-1">
                  {activity.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {activity.description}
                </p>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
              
              {activity.type === "challenge" && (
                <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}