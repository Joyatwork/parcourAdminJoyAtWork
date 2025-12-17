import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { HealthMetrics } from "@/components/Dashboard/HealthMetrics";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { RecentActivity } from "@/components/Dashboard/RecentActivity";
import { UpcomingAppointments } from "@/components/Dashboard/UpcomingAppointments";
import { WellnessInsights } from "@/components/Dashboard/WellnessInsights";
import { QVCTOverview } from "@/components/Dashboard/QVCTOverview";
import { ROICalculator } from "@/components/Dashboard/ROICalculator";
import { EmployeeVerbatims } from "@/components/Dashboard/EmployeeVerbatims";
import { AdvancedKPIs } from "@/components/Dashboard/AdvancedKPIs";
import { RealTimeAlerts } from "@/components/Dashboard/RealTimeAlerts";
import { PredictiveAnalytics } from "@/components/Dashboard/PredictiveAnalytics";
import { PerformanceEngagementChart } from "@/components/Dashboard/PerformanceEngagementChart";
import { AbsenteeismCostBreakdown } from "@/components/Dashboard/AbsenteeismCostBreakdown";
import { StrategicQVCTHeader } from "@/components/Dashboard/StrategicQVCTHeader";
import PractitionersDashboard from "@/pages/PractitionersDashboard";
import Companies from "@/pages/Companies";
import ChallengesDashboard from "@/pages/ChallengesDashboard";
import SanteDiagnosticDashboard from "@/pages/SanteDiagnosticDashboard";
import RendezVousDashboard from "@/pages/RendezVousDashboard";
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  Bell,
  Calendar,
  Users,
  BarChart3,
  Zap
} from "lucide-react";

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const location = useLocation();
  const navigate = useNavigate();

  // Synchroniser activeSection avec la route actuelle
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveSection('overview');
    } else if (location.pathname === '/practitioners') {
      setActiveSection('practitioners');
    } else if (location.pathname === '/companies') {
      setActiveSection('companies');
    } else if (location.pathname === '/challenges') {
      setActiveSection('challenges');
    } else if (location.pathname === '/sante-diagnostic') {
      setActiveSection('health');
    } else if (location.pathname === '/rendez-vous') {
      setActiveSection('appointments');
    }
  }, [location.pathname]);

  // Fonction pour gérer les changements de section avec navigation
  const handleSectionChange = (section: string) => {
    if (section === 'practitioners') {
      navigate('/practitioners');
    } else if (section === 'companies') {
      navigate('/companies');
    } else if (section === 'challenges') {
      navigate('/challenges');
    } else if (section === 'health') {
      navigate('/sante-diagnostic');
    } else if (section === 'appointments') {
      navigate('/rendez-vous');
    } else if (section === 'overview') {
      navigate('/');
    } else {
      // Pour les autres sections, utiliser le state local
      setActiveSection(section);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        
        <main className="flex-1">
          {activeSection === "practitioners" ? (
            <PractitionersDashboard />
          ) : activeSection === "companies" ? (
            <Companies />
          ) : activeSection === "challenges" ? (
            <ChallengesDashboard />
          ) : activeSection === "health" ? (
            <SanteDiagnosticDashboard />
          ) : activeSection === "appointments" ? (
            <RendezVousDashboard />
          ) : (
            <div className="p-6 space-y-6">
              {/* Strategic QVCT Header */}
              <StrategicQVCTHeader />

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-primary text-white border-0 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Score bien-être</p>
                      <p className="text-3xl font-bold">84%</p>
                    </div>
                    <Heart className="w-8 h-8 text-blue-200" />
                  </div>
                  <Progress value={84} className="mt-3 bg-blue-400" />
                </Card>

                <Card className="p-6 bg-gradient-wellness text-white border-0 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Objectifs atteints</p>
                      <p className="text-3xl font-bold">7/10</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                  <Progress value={70} className="mt-3 bg-green-400" />
                </Card>

                <Card className="p-6 bg-gradient-energy text-white border-0 shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Équipe active</p>
                      <p className="text-3xl font-bold">156</p>
                    </div>
                    <Users className="w-8 h-8 text-orange-200" />
                  </div>
                  <div className="mt-3 text-sm text-orange-100">+12% ce mois</div>
                </Card>

                <Card className="p-6 border shadow-soft">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Alertes critiques</p>
                      <p className="text-3xl font-bold text-warning">3</p>
                    </div>
                    <Zap className="w-8 h-8 text-warning" />
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">À traiter</div>
                </Card>
              </div>

              {/* Performance vs Engagement Analysis */}
              <PerformanceEngagementChart />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <AbsenteeismCostBreakdown />
                  <HealthMetrics />
                  <QVCTOverview />
                  <ROICalculator />
                  <AdvancedKPIs />
                  <PredictiveAnalytics />
                  <WellnessInsights />
                  <EmployeeVerbatims />
                </div>
                
                <div className="space-y-6">
                  <QuickActions />
                  <RealTimeAlerts />
                  <UpcomingAppointments />
                  <RecentActivity />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}