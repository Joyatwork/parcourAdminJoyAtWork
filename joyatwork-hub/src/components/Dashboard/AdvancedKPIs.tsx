import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  UserX,
  Heart,
  Brain,
  Calendar,
  Euro,
  Target,
  Activity,
  Briefcase,
  Building,
  BarChart3,
  FileText
} from "lucide-react";

export function AdvancedKPIs() {
  const absenteeismData = [
    { period: "Jan", rate: 4.2, target: 3.5, trend: "+0.3%" },
    { period: "Fév", rate: 3.8, target: 3.5, trend: "-0.4%" },
    { period: "Mar", rate: 3.2, target: 3.5, trend: "-0.6%" },
    { period: "Avr", rate: 2.9, target: 3.5, trend: "-0.3%" }
  ];

  const turnoverMetrics = [
    { department: "Commercial", rate: 18.5, cost: 45000, preventable: 75 },
    { department: "IT", rate: 12.3, cost: 38000, preventable: 85 },
    { department: "RH", rate: 8.7, cost: 25000, preventable: 90 },
    { department: "Finance", rate: 6.2, cost: 22000, preventable: 80 }
  ];

  const riskIndicators = [
    { 
      type: "TMS", 
      affected: 47, 
      risk: "Élevé", 
      cost: "125k€", 
      prevention: 85,
      icon: Shield,
      color: "text-destructive"
    },
    { 
      type: "Stress/Burnout", 
      affected: 23, 
      risk: "Moyen", 
      cost: "78k€", 
      prevention: 72,
      icon: Brain,
      color: "text-warning"
    },
    { 
      type: "Accidents travail", 
      affected: 12, 
      risk: "Faible", 
      cost: "35k€", 
      prevention: 95,
      icon: AlertTriangle,
      color: "text-success"
    }
  ];

  const productivityMetrics = [
    { metric: "Engagement équipe", value: 76, change: "+8%", status: "good" },
    { metric: "Performance collective", value: 82, change: "+12%", status: "excellent" },
    { metric: "Satisfaction manager", value: 69, change: "-2%", status: "warning" },
    { metric: "Climat social", value: 74, change: "+5%", status: "good" }
  ];

  const demographicRisks = [
    { age: "18-25", risk: "Turnover élevé", rate: 28, action: "Mentoring" },
    { age: "26-35", risk: "Équilibre vie-pro", rate: 35, action: "Flexibilité" },
    { age: "36-45", risk: "Charge mentale", rate: 42, action: "Support" },
    { age: "46-55", risk: "TMS/Fatigue", rate: 38, action: "Ergonomie" },
    { age: "55+", risk: "Adaptation tech", rate: 25, action: "Formation" }
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <CardTitle className="text-xl">KPIs Avancés Admin/RH</CardTitle>
            <p className="text-muted-foreground">Indicateurs stratégiques et prédictifs</p>
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
            <FileText className="w-4 h-4" />
            Rapport complet
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="absenteeism" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 lg:grid-cols-5">
            <TabsTrigger value="absenteeism" className="whitespace-normal px-3 py-2 text-center">Absentéisme</TabsTrigger>
            <TabsTrigger value="turnover" className="whitespace-normal px-3 py-2 text-center">Turnover</TabsTrigger>
            <TabsTrigger value="risks" className="whitespace-normal px-3 py-2 text-center">Risques</TabsTrigger>
            <TabsTrigger value="productivity" className="whitespace-normal px-3 py-2 text-center">Productivité</TabsTrigger>
            <TabsTrigger value="demographics" className="whitespace-normal px-3 py-2 text-center">Démographique</TabsTrigger>
          </TabsList>

          <TabsContent value="absenteeism" className="space-y-6">
            {/* Taux d'absentéisme par période */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Évolution mensuelle
                </h4>
                <div className="space-y-3">
                  {absenteeismData.map((item) => (
                    <div key={item.period} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-8">{item.period}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold">{item.rate}%</span>
                          <Badge variant={item.rate > item.target ? "destructive" : "secondary"}>
                            {item.rate > item.target ? "Au-dessus" : "Objectif"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Objectif: {item.target}%</div>
                        <div className={`text-sm font-medium ${item.trend.startsWith('+') ? 'text-destructive' : 'text-success'}`}>
                          {item.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  Coûts d'absentéisme
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-primary text-white rounded-lg">
                    <div className="text-3xl font-bold">1.2M€</div>
                    <div className="text-sm text-blue-100">Coût total annuel</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-semibold">680k€</div>
                      <div className="text-xs text-muted-foreground">Remplacements</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-lg font-semibold">520k€</div>
                      <div className="text-xs text-muted-foreground">Perte productivité</div>
                    </div>
                  </div>
                  <div className="text-sm text-success font-medium">
                    💡 Économie potentielle: 380k€ avec prévention
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="turnover" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <UserX className="w-5 h-5 text-destructive" />
                  Turnover par département
                </h4>
                <div className="space-y-3">
                  {turnoverMetrics.map((dept) => (
                    <div key={dept.department} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{dept.department}</span>
                        </div>
                        <Badge variant={dept.rate > 15 ? "destructive" : dept.rate > 10 ? "secondary" : "outline"}>
                          {dept.rate}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Coût/départ</div>
                          <div className="font-semibold">{dept.cost.toLocaleString()}€</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Prévention</div>
                          <div className="font-semibold text-success">{dept.preventable}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Économie</div>
                          <div className="font-semibold text-primary">
                            {Math.round(dept.cost * dept.preventable / 100).toLocaleString()}€
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4">Actions prioritaires</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="font-medium text-destructive">Urgent</div>
                    <div className="text-sm">Plan rétention Commercial</div>
                    <div className="text-xs text-muted-foreground mt-1">ROI: 185%</div>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="font-medium text-warning">Important</div>
                    <div className="text-sm">Formation management IT</div>
                    <div className="text-xs text-muted-foreground mt-1">ROI: 142%</div>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="font-medium text-success">Suivi</div>
                    <div className="text-sm">Amélioration continue RH</div>
                    <div className="text-xs text-muted-foreground mt-1">ROI: 98%</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Facteurs de risques identifiés
                </h4>
                <div className="space-y-4">
                  {riskIndicators.map((risk) => {
                    const Icon = risk.icon;
                    return (
                      <div key={risk.type} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${risk.color}`} />
                            <span className="font-medium">{risk.type}</span>
                          </div>
                          <Badge variant={risk.risk === "Élevé" ? "destructive" : risk.risk === "Moyen" ? "secondary" : "outline"}>
                            {risk.risk}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-muted-foreground">Personnes</div>
                            <div className="font-semibold">{risk.affected}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Coût estimé</div>
                            <div className="font-semibold text-destructive">{risk.cost}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Prévention</div>
                            <div className="font-semibold text-success">{risk.prevention}%</div>
                          </div>
                        </div>
                        <Progress value={risk.prevention} className="mt-3 h-2" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-success" />
                  Plan d'action préventif
                </h4>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-wellness text-white rounded-lg">
                    <div className="font-semibold">Programme TMS</div>
                    <div className="text-sm text-green-100 mb-2">
                      Formation ergonomie + équipement
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Budget: 45k€</span>
                      <span>ROI: +280%</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-primary text-white rounded-lg">
                    <div className="font-semibold">Gestion stress</div>
                    <div className="text-sm text-blue-100 mb-2">
                      Coaching + espaces détente
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Budget: 32k€</span>
                      <span>ROI: +190%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-energy text-white rounded-lg">
                    <div className="font-semibold">Sécurité renforcée</div>
                    <div className="text-sm text-orange-100 mb-2">
                      Formation + équipements
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Budget: 18k€</span>
                      <span>ROI: +420%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-4">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Indicateurs de performance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {productivityMetrics.map((metric) => (
                    <div key={metric.metric} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <Badge variant={
                          metric.status === "excellent" ? "secondary" : 
                          metric.status === "good" ? "outline" : 
                          "destructive"
                        }>
                          {metric.status === "excellent" ? "Excellent" : 
                           metric.status === "good" ? "Bon" : "Attention"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{metric.value}%</span>
                        <span className={`text-sm font-medium ${
                          metric.change.startsWith('+') ? 'text-success' : 'text-destructive'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                      <Progress value={metric.value} className="mt-2 h-2" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4">Impact financier</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="text-lg font-bold text-success">+12%</div>
                    <div className="text-sm">Productivité globale</div>
                    <div className="text-xs text-muted-foreground">+840k€ de valeur</div>
                  </div>
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <div className="text-lg font-bold text-primary">-8%</div>
                    <div className="text-sm">Coûts opérationnels</div>
                    <div className="text-xs text-muted-foreground">-320k€ économisés</div>
                  </div>
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="text-lg font-bold text-warning">+15%</div>
                    <div className="text-sm">Satisfaction client</div>
                    <div className="text-xs text-muted-foreground">+290k€ de CA</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <Card className="p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Analyse des risques par tranche d'âge
              </h4>
              <div className="space-y-4">
                {demographicRisks.map((demo) => (
                  <div key={demo.age} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-16">{demo.age} ans</span>
                        <span className="text-sm text-muted-foreground">{demo.risk}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">{demo.rate}% concernés</span>
                        <Badge variant="outline">{demo.action}</Badge>
                      </div>
                    </div>
                    <Progress value={demo.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-4">Recommandations ciblées</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Jeunes talents (18-35)</div>
                    <div className="text-sm text-muted-foreground">
                      Programme mentoring + flexibilité horaire
                    </div>
                    <div className="text-xs text-success mt-1">Impact: -40% turnover</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Cadres séniors (36-55)</div>
                    <div className="text-sm text-muted-foreground">
                      Support psychologique + ergonomie
                    </div>
                    <div className="text-xs text-success mt-1">Impact: -30% arrêts maladie</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Séniors (55+)</div>
                    <div className="text-sm text-muted-foreground">
                      Formation digitale + aménagements
                    </div>
                    <div className="text-xs text-success mt-1">Impact: +25% engagement</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-4">Prévisions 12 mois</h4>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-success" />
                      <span className="font-medium">Risques en baisse</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      TMS: -45% | Stress: -30% | Turnover: -25%
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="font-medium">Indicateurs positifs</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Engagement: +20% | Productivité: +15% | Satisfaction: +18%
                    </div>
                  </div>
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <div className="font-medium text-success">ROI global prévu</div>
                    <div className="text-xl font-bold text-success">+325%</div>
                    <div className="text-xs text-muted-foreground">
                      1.8M€ économisés sur investissement 450k€
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}