import { Sidebar } from "@/components/Dashboard/Sidebar";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

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
    } else if (location.pathname === "/billing" || location.pathname.startsWith("/billing/")) {
      setActiveSection("billing");
    } else if (location.pathname === "/qvct") {
      setActiveSection("qvct");
    } else if (location.pathname === "/analytics") {
      setActiveSection("analytics");
    } else if (location.pathname === "/churn") {
      setActiveSection("churn");
    } else if (location.pathname === "/contents") {
      setActiveSection("contents");
    } else if (location.pathname === "/users") {
      setActiveSection("users");
    }
  }, [location.pathname]);

  // Si page login → pas de sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} />

      {/* Contenu */}
      <main className="flex-1 min-w-0 ml-64 p-6">
        {children}
      </main>
    </div>
  );
}