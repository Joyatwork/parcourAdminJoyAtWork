import { ROICalculator } from "@/components/Dashboard/ROICalculator";
import { EmployeeVerbatims } from "@/components/Dashboard/EmployeeVerbatims";
import { AdvancedKPIs } from "@/components/Dashboard/AdvancedKPIs";
import { PerformanceEngagementChart } from "@/components/Dashboard/PerformanceEngagementChart";
import { AbsenteeismCostBreakdown } from "@/components/Dashboard/AbsenteeismCostBreakdown";
import { StrategicQVCTHeader } from "@/components/Dashboard/StrategicQVCTHeader";

const Index = () => {
  return (
    <div className="min-w-0 overflow-x-hidden px-4 py-5 md:px-6 md:py-6 xl:px-10">
      <div className="mx-auto w-full max-w-[1760px] space-y-10 2xl:space-y-12">
        {/* Strategic QVCT Header */}
        <StrategicQVCTHeader />
        
        {/* Performance & Engagement Chart */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg md:text-xl xl:text-2xl font-semibold text-gray-900">Vue de pilotage</h2>
            <p className="mt-1 text-sm md:text-base text-gray-500">
              Lecture globale des indicateurs de performance et d'engagement.
            </p>
          </div>
          <PerformanceEngagementChart />
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-lg md:text-xl xl:text-2xl font-semibold text-gray-900">Indicateurs principaux</h2>
            <p className="mt-1 text-sm md:text-base text-gray-500">
              Organisation plus large des blocs pour améliorer la lisibilité selon la taille d'écran et le zoom.
            </p>
          </div>

          <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 xl:gap-8 items-start">
            <div className="2xl:col-span-7">
              <AbsenteeismCostBreakdown />
            </div>
            <div className="2xl:col-span-5">
              <ROICalculator />
            </div>
          </div>

          <div className="w-full">
            <AdvancedKPIs />
          </div>
        </section>

        {/* Bottom Row - Extended Analytics */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg md:text-xl xl:text-2xl font-semibold text-gray-900">Retours collaborateurs</h2>
            <p className="mt-1 text-sm md:text-base text-gray-500">
              Verbatims affichés en pleine largeur pour une lecture plus confortable.
            </p>
          </div>

          {/* Employee Verbatims */}
          <EmployeeVerbatims />
        </section>
      </div>
    </div>
  );
};

export default Index;
