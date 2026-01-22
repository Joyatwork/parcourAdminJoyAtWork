import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { BenchmarkCharts } from "@/components/Dashboard/BenchmarkCharts";

const Index = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Strategic QVCT Header */}
      <StrategicQVCTHeader />
      
      
      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Primary Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance & Engagement Chart */}
          <PerformanceEngagementChart />
          
          {/* Health Metrics Overview */}
          <HealthMetrics />

          
          {/* Advanced KPIs Admin*/}
          <AdvancedKPIs />
          
          {/* QVCT Strategic Overview */}
          <QVCTOverview />
        </div>

        {/* Right Column - Secondary Info */}
        <div className="space-y-6">
          {/* Real-time Alerts */}
          <RealTimeAlerts />
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Upcoming Appointments */}
          <UpcomingAppointments />
          
          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>

      {/* Bottom Row - Extended Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Verbatims */}
        <EmployeeVerbatims />

        {/* ROI Calculator */}
        <ROICalculator />
      </div>

      {/* Advanced Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Analytics */}
        <PredictiveAnalytics />
        
        {/* Absenteeism Cost Breakdown */}
        <AbsenteeismCostBreakdown />
      </div>

      {/* Wellness Insights */}
      <WellnessInsights />
    </div>
  );
};

export default Index;
