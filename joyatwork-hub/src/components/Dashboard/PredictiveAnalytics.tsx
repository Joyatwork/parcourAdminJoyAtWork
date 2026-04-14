import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdoptionChurnWidget } from "@/components/Dashboard/AdoptionChurnWidget";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  Zap,
  Heart,
  DollarSign,
  Shield
} from "lucide-react";

export function PredictiveAnalytics() {
  const riskPredictions = [
    {
      category: "Burnout",
      currentRisk: 68,
      prediction3m: 85,
      prediction6m: 72,
      prediction12m: 45,
      peopleAtRisk: 23,
      cost: "180k€",
      prevention: "Formation stress + charge travail",
      confidence: 92
    },
    {
      category: "Turnover",
      currentRisk: 45,
      prediction3m: 62,
      prediction6m: 58,
      prediction12m: 35,
      peopleAtRisk: 15,
      cost: "340k€",
      prevention: "Programme rétention + évolution",
      confidence: 88
    },
    {
      category: "TMS",
      currentRisk: 52,
      prediction3m: 48,
      prediction6m: 35,
      prediction12m: 25,
      peopleAtRisk: 31,
      cost: "95k€",
      prevention: "Ergonomie + formation",
      confidence: 95
    }
  ];

  const interventionScenarios = [
    {
      name: "Intervention immédiate",
      investment: "85k€",
      timeline: "1-3 mois",
      riskReduction: 75,
      roi: 320,
      actions: ["Formation urgente", "Réorganisation", "Support psychologique"]
    },
    {
      name: "Plan progressif",
      investment: "65k€",
      timeline: "3-6 mois",
      riskReduction: 60,
      roi: 240,
      actions: ["Formation graduée", "Amélioration ergonomie", "Coaching"]
    },
    {
      name: "Prévention douce",
      investment: "35k€",
      timeline: "6-12 mois",
      riskReduction: 35,
      roi: 150,
      actions: ["Sensibilisation", "Outils bien-être", "Suivi régulier"]
    }
  ];

  const monthlyPredictions = [
    { month: "Oct", stress: 45, turnover: 12, accidents: 3, engagement: 72 },
    { month: "Nov", stress: 52, turnover: 15, accidents: 2, engagement: 69 },
    { month: "Déc", stress: 58, turnover: 18, accidents: 4, engagement: 65 },
    { month: "Jan", stress: 48, turnover: 14, accidents: 2, engagement: 71 },
    { month: "Fév", stress: 42, turnover: 11, accidents: 1, engagement: 76 },
    { month: "Mar", stress: 38, turnover: 9, accidents: 1, engagement: 79 }
  ];

  const personalizedRecommendations = [
    {
      department: "Commercial",
      priority: "Critique",
      issue: "Charge de travail excessive",
      prediction: "Burnout dans 6 semaines",
      solution: "Redistribution urgente + formation gestion stress",
      impact: "15 personnes",
      cost: "45k€"
    },
    {
      department: "IT",
      priority: "Élevé",
      issue: "Manque de reconnaissance",
      prediction: "Turnover +40% dans 3 mois",
      solution: "Plan carrière + augmentations ciblées",
      impact: "8 personnes",
      cost: "78k€"
    },
    {
      department: "Logistique",
      priority: "Moyen",
      issue: "Conditions ergonomiques",
      prediction: "TMS +30% dans 4 mois",
      solution: "Équipements + formation postures",
      impact: "22 personnes",
      cost: "25k€"
    }
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <div className="min-w-0">
              <CardTitle className="text-xl">Analytics Prédictives IA</CardTitle>
              <p className="text-muted-foreground">Anticipation et prévention intelligente</p>
            </div>
          </div>
          <Badge variant="secondary" className="w-fit bg-gradient-primary text-white whitespace-normal">
            <Zap className="w-3 h-3 mr-1" />
            IA Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 lg:grid-cols-5">
            <TabsTrigger value="predictions" className="whitespace-normal px-3 py-2 text-center">Prédictions</TabsTrigger>
            <TabsTrigger value="scenarios" className="whitespace-normal px-3 py-2 text-center">Scénarios</TabsTrigger>
            <TabsTrigger value="timeline" className="whitespace-normal px-3 py-2 text-center">Timeline</TabsTrigger>
            <TabsTrigger value="recommendations" className="whitespace-normal px-3 py-2 text-center">Actions</TabsTrigger>
            <TabsTrigger value="churn" className="whitespace-normal px-3 py-2 text-center">Churn Risk</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {riskPredictions.map((risk) => (
                <Card key={risk.category} className="p-4 border-l-4 border-l-warning">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{risk.category}</h4>
                    <Badge variant="outline" className="text-xs">
                      {risk.confidence}% fiabilité
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risque actuel</span>
                        <span className="font-bold">{risk.currentRisk}%</span>
                      </div>
                      <Progress value={risk.currentRisk} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{risk.prediction3m}%</div>
                        <div className="text-muted-foreground">3 mois</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{risk.prediction6m}%</div>
                        <div className="text-muted-foreground">6 mois</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-semibold">{risk.prediction12m}%</div>
                        <div className="text-muted-foreground">12 mois</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Personnes à risque:</span>
                        <span className="font-semibold text-destructive">{risk.peopleAtRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coût estimé:</span>
                        <span className="font-semibold text-destructive">{risk.cost}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-primary/10 rounded-lg">
                      <div className="text-xs text-primary font-medium mb-1">Prévention recommandée</div>
                      <div className="text-xs">{risk.prevention}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-gradient-subtle">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-success" />
                Impact global des prédictions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-destructive/10 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">69</div>
                  <div className="text-sm text-muted-foreground">Personnes à risque</div>
                </div>
                <div className="text-center p-3 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning">615k€</div>
                  <div className="text-sm text-muted-foreground">Coût total prévu</div>
                </div>
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">450k€</div>
                  <div className="text-sm text-muted-foreground">Économies possibles</div>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">73%</div>
                  <div className="text-sm text-muted-foreground">Réduction risque</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <div className="space-y-4">
              {interventionScenarios.map((scenario) => (
                <Card key={scenario.name} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        scenario.name.includes('immédiate') ? 'bg-destructive/10 text-destructive' :
                        scenario.name.includes('progressif') ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">{scenario.timeline}</p>
                      </div>
                    </div>
                    <Badge variant={scenario.roi > 250 ? "default" : scenario.roi > 200 ? "secondary" : "outline"}>
                      ROI {scenario.roi}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-primary">{scenario.investment}</div>
                      <div className="text-xs text-muted-foreground">Investissement</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-success">{scenario.riskReduction}%</div>
                      <div className="text-xs text-muted-foreground">Réduction risque</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-warning">{scenario.timeline}</div>
                      <div className="text-xs text-muted-foreground">Délai</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-bold text-primary">{scenario.roi}%</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Actions incluses:</div>
                    <div className="flex flex-wrap gap-2">
                      {scenario.actions.map((action) => (
                        <Badge key={action} variant="outline" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-gradient-primary text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Recommandation IA</h4>
                  <p className="text-sm text-blue-100">
                    Scénario "Plan progressif" optimise le ratio coût/efficacité
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Appliquer
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Évolution prédite sur 6 mois
              </h4>
              <div className="space-y-4">
                {monthlyPredictions.map((month) => (
                  <div key={month.month} className="grid grid-cols-5 gap-4 p-3 border rounded-lg">
                    <div className="font-medium">{month.month}</div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-warning">{month.stress}%</div>
                      <div className="text-xs text-muted-foreground">Stress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-destructive">{month.turnover}%</div>
                      <div className="text-xs text-muted-foreground">Turnover</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-secondary">{month.accidents}</div>
                      <div className="text-xs text-muted-foreground">Accidents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-success">{month.engagement}%</div>
                      <div className="text-xs text-muted-foreground">Engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Points de basculement
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Stress critique</span>
                    <Badge variant="destructive">Décembre</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Amélioration engagement</span>
                    <Badge variant="secondary">Février</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Stabilisation turnover</span>
                    <Badge variant="outline">Mars</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Interventions optimales
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-primary/10 rounded">
                    <div className="font-medium">Novembre - Stress</div>
                    <div className="text-xs text-muted-foreground">Formation gestion pression</div>
                  </div>
                  <div className="p-2 bg-warning/10 rounded">
                    <div className="font-medium">Janvier - Turnover</div>
                    <div className="text-xs text-muted-foreground">Plan rétention ciblé</div>
                  </div>
                  <div className="p-2 bg-success/10 rounded">
                    <div className="font-medium">Février - Engagement</div>
                    <div className="text-xs text-muted-foreground">Maintenir dynamique positive</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              {personalizedRecommendations.map((rec) => (
                <Card key={rec.department} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{rec.department}</h4>
                        <p className="text-sm text-muted-foreground">{rec.impact}</p>
                      </div>
                    </div>
                    <Badge variant={
                      rec.priority === "Critique" ? "destructive" :
                      rec.priority === "Élevé" ? "secondary" : "outline"
                    }>
                      {rec.priority}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Problématique identifiée:</span>
                        <p className="text-sm text-muted-foreground">{rec.issue}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Prédiction:</span>
                        <p className="text-sm text-destructive">{rec.prediction}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Solution recommandée:</span>
                        <p className="text-sm text-success">{rec.solution}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Budget estimé:</span>
                        <p className="text-sm font-semibold text-primary">{rec.cost}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-gradient-wellness text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Plan d'action global recommandé
                  </h4>
                  <p className="text-sm text-green-100 mt-1">
                    Intervention coordonnée sur 3 mois pour maximiser l'impact
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">148k€</div>
                  <div className="text-sm text-green-100">Budget total</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">75%</div>
                  <div className="text-xs text-green-100">Réduction risque</div>
                </div>
                <div>
                  <div className="text-lg font-bold">890k€</div>
                  <div className="text-xs text-green-100">Économies prévues</div>
                </div>
                <div>
                  <div className="text-lg font-bold">601%</div>
                  <div className="text-xs text-green-100">ROI</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="churn" className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-foreground">Adoption et risque de churn</h4>
              <p className="text-sm text-muted-foreground">
                Centralisation des signaux d'adoption, satisfaction et risque de désengagement client.
              </p>
            </div>
            <AdoptionChurnWidget />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}