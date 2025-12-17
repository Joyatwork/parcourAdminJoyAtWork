import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Dashboard/Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();

  // Synchroniser activeSection avec la route actuelle
  useEffect(() => {
    if (location.pathname === "/") {
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
    }
  }, [location.pathname]);

  // Fonction pour gérer les changements de section avec navigation
  const handleSectionChange = (section: string) => {
    // Cette fonction sera gérée par la navigation React Router
    // La sidebar utilisera directement les liens de navigation
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
