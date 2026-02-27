import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Dashboard/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();
  const isAuthPage = location.pathname === "/login";

  // Synchroniser activeSection avec la route actuelle
  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      setActiveSection("overview");
    } else if (location.pathname === "/practitioners") {
      setActiveSection("practitioners");
    } else if (location.pathname === "/companies") {
      setActiveSection("companies");
    } else if (location.pathname === "/contracts") {
      setActiveSection("contracts");
    } else if (location.pathname === "/challenges") {
      setActiveSection("challenges");
    } else if (location.pathname === "/sante-diagnostic") {
      setActiveSection("health");
    } else if (location.pathname === "/rendez-vous") {
      setActiveSection("appointments");
    } else if (location.pathname === "/billing" || location.pathname.startsWith("/billing/")) {
      setActiveSection("billing");
    }else if (location.pathname === "/qvct") {
      setActiveSection("qvct");
    }else if (location.pathname === "/analytics") {
      setActiveSection("analytics");
    }else if (location.pathname === "/users") {
      setActiveSection("users");
    }
  }, [location.pathname]);

  // Fonction pour gérer les changements de section avec navigation
  const handleSectionChange = (section: string) => {
    // Cette fonction sera gérée par la navigation React Router
    // La sidebar utilisera directement les liens de navigation
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </div>
  );
}
