import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  Heart,
  FileText,
  LogOut,
  Stethoscope,
  Target,
<<<<<<< HEAD
  Shield,
=======
  TrendingUp,
>>>>>>> 3157de8 (WIP : sauvegarde des modifications avant rebase sur dev)
  Building2,
  DollarSign,
} from "lucide-react";

export function Sidebar() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const storedUser = localStorage.getItem("user");
  let parsedUser: { first_name?: string; last_name?: string; name?: string } | null = null;

  try {
    parsedUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    parsedUser = null;
  }

  const normalizedFirstName = parsedUser?.first_name?.trim() ?? "";
  const normalizedLastName = parsedUser?.last_name?.trim() ?? "";

  const legacyFullName = parsedUser?.name?.trim() ?? "";
  const fullName = [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ") || legacyFullName || "Administrateur";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavigation = (section: string) => {
    switch (section) {
      case "overview":
        navigate("/dashboard");
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
      case "billing":
        navigate("/billing");
        break;
      case "qvct":
        navigate("/qvct");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "users":
        navigate("/users");
        break;
      case "logout":
        setIsLogoutOpen(true);
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
    { id: "billing", label: "Billing & Wallet", icon: DollarSign },
    { id: "reports", label: "Rapports", icon: FileText },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "logout", label: "Déconnexion", icon: LogOut },
  ];

  return (
    <>
      <aside className="w-64 bg-card border-r border-border h-screen fixed inset-y-0 left-0 z-20 overflow-y-auto scrollbar-hide">
        <div className="p-6">
=======
  const location = useLocation();

  const menuItems = [
    { id: "/", label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "/sante-diagnostic", label: "Santé & Diagnostic", icon: Heart },
    { id: "/companies", label: "Entreprises", icon: Building2 },
    { id: "/practitioners", label: "Praticiens", icon: Stethoscope },
    { id: "/challenges", label: "Challenges", icon: Target },

    // ✅ CHURN page (si widget dans Index → laisser "/")
    { id: "/churn", label: "Churn Risk", icon: TrendingUp },

    { id: "/billing", label: "Billing & Wallet", icon: DollarSign },
    { id: "/reports", label: "Rapports", icon: FileText },
    { id: "/settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border h-screen fixed inset-y-0 left-0 z-20 overflow-y-auto">
      <div className="p-6">
        {/* LOGO */}
>>>>>>> 3157de8 (WIP : sauvegarde des modifications avant rebase sur dev)
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">Joyatwork Admin</h2>
            <p className="text-xs text-muted-foreground">{fullName}</p>
          </div>
        </div>

        {/* MENU */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.id;

            return (
              <Button
                key={item.id}
<<<<<<< HEAD
                variant={activeSection === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${activeSection === item.id
                  ? "bg-gradient-primary text-white shadow-soft"
                  : item.id === "logout"
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                onClick={() => {
                  handleNavigation(item.id);
                }}
=======
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 ${
                  isActive
                    ? "bg-gradient-primary text-white shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => navigate(item.id)}
>>>>>>> 3157de8 (WIP : sauvegarde des modifications avant rebase sur dev)
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        </div>
      </aside>

      <AlertDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez être déconnecté de l’espace administrateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Se déconnecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}