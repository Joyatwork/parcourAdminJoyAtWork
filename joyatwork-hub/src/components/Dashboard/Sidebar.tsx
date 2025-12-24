import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  Heart,
  Calendar,
  Users,
  BarChart3,
  FileText,
  Settings,
  Stethoscope,
  Target,
  Shield,
  TrendingUp,
  Building2,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navigate = useNavigate();

  const handleNavigation = (section: string) => {
    switch (section) {
      case "overview":
        navigate("/");
        break;
      case "practitioners":
        navigate("/practitioners");
        break;
      case "companies":
        navigate("/companies");
        break;
      case "contracts":
        navigate("/contracts");
        break;
      case "challenges":
        navigate("/challenges");
        break;
      case "health":
        navigate("/sante-diagnostic");
        break;
      default:
        onSectionChange(section);
    }
  };

  const menuItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "health", label: "Santé & Diagnostic", icon: Heart },
    { id: "qvct", label: "QVCT", icon: Shield },
    { id: "analytics", label: "Analyses", icon: BarChart3 },
    { id: "companies", label: "Entreprises", icon: Building2 },
    { id: "contracts", label: "Contrats", icon: FileText },
    { id: "practitioners", label: "Praticiens", icon: Stethoscope },
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "reports", label: "Rapports", icon: FileText },
    { id: "trends", label: "Tendances", icon: TrendingUp },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Joyatwork</h2>
            <p className="text-xs text-muted-foreground">Santé & Bien-être</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${activeSection === item.id
                  ? "bg-gradient-primary text-white shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                onClick={() => {
                  handleNavigation(item.id);
                }}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
