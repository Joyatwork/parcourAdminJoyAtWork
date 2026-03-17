import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Euro,
  Target
} from "lucide-react";

interface ROIMetric {
  category: string;
  beforeValue: number;
  afterValue: number;
  improvement: number;
  costSaving: number;
  timeframe: string;
  icon: React.ReactNode;
}

interface CaseStudy {
  profession: string;
  participants: number;
  duration: string;
  improvements: {
    metric: string;
    before: number;
    after: number;
    reduction: number;
  }[];
  totalSavings: number;
}

export function ROICalculator() {
  const [selectedMetric, setSelectedMetric] = useState<string>("tms");

  const roiMetrics: ROIMetric[] = [
    {
      category: "TMS & Douleurs dorsales",
      beforeValue: 65,
      afterValue: 45,
      improvement: 30,
      costSaving: 85000,
      timeframe: "8 semaines",
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      category: "Stress & Anxiété",
      beforeValue: 45,
      afterValue: 31,
      improvement: 30,
      costSaving: 120000,
      timeframe: "8 semaines",
      icon: <TrendingDown className="w-5 h-5" />
    },
    {
      category: "Arrêts de travail",
      beforeValue: 18,
      afterValue: 15,
      improvement: 15,
      costSaving: 75000,
      timeframe: "3 mois",
      icon: <Clock className="w-5 h-5" />
    },
    {
      category: "Turnover",
      beforeValue: 22,
      afterValue: 18,
      improvement: 18,
      costSaving: 150000,
      timeframe: "12 mois",
      icon: <Users className="w-5 h-5" />
    }
  ];

  const caseStudies: CaseStudy[] = [
    {
      profession: "Agents Back-Office",
      participants: 156,
      duration: "12 semaines",
      improvements: [
        { metric: "Douleurs dorsales", before: 68, after: 47, reduction: 30 },
        { metric: "Fatigue", before: 72, after: 54, reduction: 25 },
        { metric: "Productivité", before: 75, after: 88, reduction: -17 }
      ],
      totalSavings: 95000
    },
    {
      profession: "Managers",
      participants: 45,
      duration: "12 semaines",
      improvements: [
        { metric: "Anxiété", before: 55, after: 38, reduction: 30 },
        { metric: "Mal-être", before: 48, after: 33, reduction: 31 },
        { metric: "Relations équipe", before: 65, after: 82, reduction: -26 }
      ],
      totalSavings: 125000
    },
    {
      profession: "Équipe commerciale",
      participants: 89,
      duration: "12 semaines",
      improvements: [
        { metric: "Stress", before: 61, after: 43, reduction: 29 },
        { metric: "Performance", before: 70, after: 85, reduction: -21 },
        { metric: "Satisfaction client", before: 78, after: 89, reduction: -14 }
      ],
      totalSavings: 110000
    }
  ];

  const notifications = [
    {
      id: 1,
      message: "Réduire 30% des douleurs dorsales en 8 semaines chez les agents back-office",
      impact: "85k€ économisés",
      status: "active",
      timeframe: "8 semaines"
    },
    {
      id: 2,
      message: "Diminuer le mal-être, l'anxiété des Managers de 30% en 8 semaines",
      impact: "120k€ économisés",
      status: "active",
      timeframe: "8 semaines"
    },
    {
      id: 3,
      message: "Réduire les absences de 15% dans 3 mois",
      impact: "75k€ économisés",
      status: "pending",
      timeframe: "3 mois"
    }
  ];

  const totalROI = roiMetrics.reduce((sum, metric) => sum + metric.costSaving, 0);

  return (
    <Card className="border shadow-soft">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            <CardTitle className="min-w-0">Calculateur ROI - Retour sur Investissement</CardTitle>
          </div>
          <Badge variant="secondary" className="w-fit bg-gradient-wellness text-white whitespace-normal">
            <Euro className="w-4 h-4 mr-1" />
            {totalROI.toLocaleString()}€ économisés
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3">
            <TabsTrigger value="metrics" className="whitespace-normal px-3 py-2 text-center">Métriques ROI</TabsTrigger>
            <TabsTrigger value="cases" className="whitespace-normal px-3 py-2 text-center">Études de cas</TabsTrigger>
            <TabsTrigger value="notifications" className="whitespace-normal px-3 py-2 text-center">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {roiMetrics.map((metric, index) => (
                <Card 
                  key={index} 
                  className={`p-4 cursor-pointer transition-all hover:shadow-medium ${
                    selectedMetric === metric.category.toLowerCase().replace(/\s+/g, '') 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => setSelectedMetric(metric.category.toLowerCase().replace(/\s+/g, ''))}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {metric.icon}
                      <span className="text-sm font-medium">{metric.category}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {metric.timeframe}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amélioration</span>
                      <span className="text-lg font-bold text-success">-{metric.improvement}%</span>
                    </div>
                    
                    <Progress 
                      value={metric.improvement} 
                      className="h-2" 
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Économies</span>
                      <span className="text-lg font-bold text-primary">
                        {metric.costSaving.toLocaleString()}€
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-gradient-subtle">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground">ROI Total Estimé</h3>
                </div>
                <div className="text-4xl font-bold text-primary">
                  {totalROI.toLocaleString()}€
                </div>
                <p className="text-muted-foreground">
                  Économies cumulées sur 12 mois grâce aux améliorations de bien-être
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <div className="space-y-6">
              {caseStudies.map((study, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{study.profession}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {study.participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {study.duration}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gradient-wellness text-white">
                      {study.totalSavings.toLocaleString()}€ économisés
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {study.improvements.map((improvement, impIndex) => (
                      <div key={impIndex} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {improvement.metric}
                          </span>
                          <span className={`text-sm font-bold ${
                            improvement.reduction > 0 ? 'text-success' : 'text-primary'
                          }`}>
                            {improvement.reduction > 0 ? '-' : '+'}{Math.abs(improvement.reduction)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                improvement.reduction > 0 ? 'bg-success' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.abs(improvement.reduction)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {improvement.before}% → {improvement.after}%
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        notification.status === 'active' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-warning/10 text-warning'
                      }`}>
                        {notification.status === 'active' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {notification.timeframe}
                          </span>
                          <span className="font-semibold text-primary">
                            {notification.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-gradient-primary text-white">
              <div className="text-center space-y-2">
                <TrendingUp className="w-8 h-8 mx-auto text-blue-200" />
                <h3 className="text-xl font-bold">Impact Prévisionnel</h3>
                <p className="text-blue-100">
                  Réduction globale estimée de 25% des coûts liés aux troubles de santé au travail
                </p>
                <div className="text-2xl font-bold">
                  430k€ d'économies potentielles
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}