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
  Shield,
  TrendingUp,
  Building2,
  DollarSign,
  Users,
  Library,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
}

export function Sidebar({ activeSection }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // ===== USER =====
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

  const fullName =
    [normalizedFirstName, normalizedLastName].filter(Boolean).join(" ") ||
    legacyFullName ||
    "Administrateur";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ===== MENU =====
  const menuItems = [
    { path: "/dashboard", key: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
    { path: "/sante-diagnostic", key: "health", label: "Santé & Diagnostic", icon: Heart },
    { path: "/qvct", key: "qvct", label: "QVCT", icon: Shield },
    { path: "/analytics", key: "analytics", label: "Analytics", icon: TrendingUp },
    { path: "/companies", key: "companies", label: "Entreprises", icon: Building2 },
    { path: "/contracts", key: "contracts", label: "Contrats", icon: FileText },
    { path: "/practitioners", key: "practitioners", label: "Praticiens", icon: Stethoscope },
    { path: "/challenges", key: "challenges", label: "Challenges", icon: Target },
    { path: "/contents", key: "contents", label: "Contenus", icon: Library },
    { path: "/billing", key: "billing", label: "Billing & Wallet", icon: DollarSign },
    { path: "/users", key: "users", label: "Utilisateurs", icon: Users },
  ];

  return (
    <>
      <aside className="w-64 bg-card border-r border-border h-screen fixed inset-y-0 left-0 z-20 overflow-y-auto">
        <div className="p-6">
          {/* LOGO */}
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
              const isActive =
                activeSection === item.key ||
                location.pathname.startsWith(item.path);

              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              );
            })}

            {/* LOGOUT */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </Button>
          </nav>
        </div>
      </aside>

      {/* LOGOUT DIALOG */}
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