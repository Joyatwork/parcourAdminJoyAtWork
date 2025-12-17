import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  FileText, 
  Target, 
  Calendar,
  Users,
  Download,
  MessageSquare,
  Activity
} from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case "nouveau-rdv":
        // Création d'un nouveau rendez-vous - naviguer vers la page rendez-vous
        navigate("/rendez-vous");
        break;
      case "auto-diagnostic":
        // Auto-diagnostic santé - naviguer vers la page de diagnostic
        navigate("/sante-diagnostic");
        break;
      case "challenge":
        // Nouveau challenge - naviguer vers la page challenges
        navigate("/challenges");
        break;
      case "export-qvct":
        // Export QVCT - télécharger rapport
        handleExportQVCT();
        break;
      default:
        console.log("Action non implémentée:", actionType);
    }
  };

  const handleExportQVCT = () => {
    // Simulation d'export de rapport QVCT
    const reportData = {
      date: new Date().toISOString().split('T')[0],
      metrics: {
        conformiteReglementaire: 94,
        maturiteQVCT: 87,
        certificationISO: 100
      },
      company: "Entreprise Example"
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport_qvct_${reportData.date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const actions = [
    {
      title: "Nouveau RDV",
      description: "Prendre rendez-vous",
      icon: Calendar,
      color: "bg-gradient-primary",
      action: "primary",
      type: "nouveau-rdv"
    },
    {
      title: "Auto-diagnostic",
      description: "Évaluation rapide",
      icon: Activity,
      color: "bg-gradient-wellness",
      action: "secondary",
      type: "auto-diagnostic"
    },
    {
      title: "Challenge",
      description: "Nouveau défi",
      icon: Target,
      color: "bg-gradient-energy",
      action: "accent",
      type: "challenge"
    },
    {
      title: "Export QVCT",
      description: "Générer rapport",
      icon: Download,
      color: "bg-muted",
      action: "outline",
      type: "export-qvct"
    }
  ];

  return (
    <Card className="p-6 shadow-soft">
      <h3 className="text-xl font-semibold text-foreground mb-4">Actions rapides</h3>
      
      <div className="space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.title}
              variant={action.action as any}
              className={`w-full justify-start gap-4 h-16 ${
                action.action !== "outline" ? action.color + " text-white border-0" : ""
              }`}
              onClick={() => handleActionClick(action.type)}
            >
              <Icon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className={`text-sm ${action.action !== "outline" ? "text-white/80" : "text-muted-foreground"}`}>
                  {action.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-subtle rounded-lg border">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <div>
            <h4 className="font-medium text-foreground">Support 24/7</h4>
            <p className="text-sm text-muted-foreground">
              Besoin d'aide ? Notre équipe est là pour vous.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}