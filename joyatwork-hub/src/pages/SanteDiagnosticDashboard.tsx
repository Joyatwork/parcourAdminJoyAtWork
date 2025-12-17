import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart,
  Activity,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Zap,
  Moon,
  Smile,
  Target,
  FileText,
  BarChart3,
  User,
  Shield
} from 'lucide-react';

interface DiagnosticResult {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  category: string;
  status: 'excellent' | 'bon' | 'moyen' | 'attention' | 'critique';
  date: string;
  recommendations: string[];
}

interface QuestionnaireSection {
  id: string;
  title: string;
  completed: boolean;
  score: number;
  maxScore: number;
  questions: number;
}

const SanteDiagnosticDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Données du questionnaire "Retour de congés"
  const questionnaireSections: QuestionnaireSection[] = [
    {
      id: 'ressenti-reprise',
      title: 'Ressenti à la reprise',
      completed: true,
      score: 18,
      maxScore: 25,
      questions: 5
    },
    {
      id: 'energie-physique',
      title: 'Énergie physique',
      completed: true,
      score: 22,
      maxScore: 30,
      questions: 6
    },
    {
      id: 'bien-etre-mental',
      title: 'Bien-être mental',
      completed: false,
      score: 0,
      maxScore: 20,
      questions: 4
    },
    {
      id: 'relations-travail',
      title: 'Relations au travail',
      completed: false,
      score: 0,
      maxScore: 15,
      questions: 3
    }
  ];

  // Résultats des diagnostics précédents
  const diagnosticResults: DiagnosticResult[] = [
    {
      id: '1',
      title: 'Auto-diagnostic - Retour de congés',
      score: 40,
      maxScore: 90,
      category: 'Réintégration',
      status: 'moyen',
      date: '2025-01-08',
      recommendations: [
        'Prévoir une période d\'adaptation progressive',
        'Planifier des pauses régulières',
        'Solliciter le soutien des collègues'
      ]
    },
    {
      id: '2',
      title: 'Évaluation stress mensuelle',
      score: 75,
      maxScore: 100,
      category: 'Stress',
      status: 'bon',
      date: '2025-01-01',
      recommendations: [
        'Maintenir les techniques de relaxation',
        'Continuer l\'activité physique régulière'
      ]
    },
    {
      id: '3',
      title: 'Bilan bien-être général',
      score: 85,
      maxScore: 100,
      category: 'Bien-être',
      status: 'excellent',
      date: '2024-12-15',
      recommendations: [
        'Excellent équilibre maintenu',
        'Partager les bonnes pratiques avec l\'équipe'
      ]
    }
  ];

  const healthMetrics = {
    overall_score: 72,
    energy_level: 78,
    stress_level: 35,
    sleep_quality: 68,
    work_satisfaction: 82,
    social_connection: 75,
    trend: '+8%'
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'attention': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critique': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'bon': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'moyen': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'attention': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'critique': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Santé & Diagnostic</h1>
            <p className="text-gray-600">Suivez votre bien-être et recevez des recommandations personnalisées</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Nouveau diagnostic
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <Heart className="w-4 h-4 mr-2" />
              Auto-évaluation
            </Button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Score Global</p>
                <p className="text-2xl font-bold text-green-900">{healthMetrics.overall_score}%</p>
                <p className="text-xs text-green-600">{healthMetrics.trend} vs mois dernier</p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Énergie</p>
                <p className="text-2xl font-bold text-orange-900">{healthMetrics.energy_level}%</p>
                <p className="text-xs text-orange-600">Niveau élevé</p>
              </div>
              <Zap className="w-8 h-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Stress</p>
                <p className="text-2xl font-bold text-red-900">{healthMetrics.stress_level}%</p>
                <p className="text-xs text-red-600">Sous contrôle</p>
              </div>
              <Brain className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Sommeil</p>
                <p className="text-2xl font-bold text-purple-900">{healthMetrics.sleep_quality}%</p>
                <p className="text-xs text-purple-600">À améliorer</p>
              </div>
              <Moon className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Satisfaction</p>
                <p className="text-2xl font-bold text-blue-900">{healthMetrics.work_satisfaction}%</p>
                <p className="text-xs text-blue-600">Très bon</p>
              </div>
              <Smile className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600">Relations</p>
                <p className="text-2xl font-bold text-teal-900">{healthMetrics.social_connection}%</p>
                <p className="text-xs text-teal-600">Équilibré</p>
              </div>
              <User className="w-8 h-8 text-teal-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="questionnaire">Questionnaire en cours</TabsTrigger>
            <TabsTrigger value="historique">Historique</TabsTrigger>
            <TabsTrigger value="recommandations">Recommandations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progression générale */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Progression des métriques
                </h3>
                <div className="space-y-4">
                  {Object.entries(healthMetrics).filter(([key]) => !['trend'].includes(key)).map(([key, value]) => {
                    const labels = {
                      overall_score: 'Score Global',
                      energy_level: 'Niveau d\'énergie', 
                      stress_level: 'Niveau de stress',
                      sleep_quality: 'Qualité du sommeil',
                      work_satisfaction: 'Satisfaction travail',
                      social_connection: 'Connexions sociales'
                    };
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{labels[key as keyof typeof labels]}</span>
                          <span className={getScoreColor(value as number, 100)}>{value}%</span>
                        </div>
                        <Progress 
                          value={value as number} 
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Dernier diagnostic */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Dernier diagnostic
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{diagnosticResults[0].title}</h4>
                    <Badge className={getStatusColor(diagnosticResults[0].status)}>
                      {diagnosticResults[0].status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{diagnosticResults[0].date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Score:</span>
                    <div className="flex-1">
                      <Progress 
                        value={(diagnosticResults[0].score / diagnosticResults[0].maxScore) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className={`text-sm font-medium ${getScoreColor(diagnosticResults[0].score, diagnosticResults[0].maxScore)}`}>
                      {diagnosticResults[0].score}/{diagnosticResults[0].maxScore}
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommandations principales:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {diagnosticResults[0].recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Target className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questionnaire" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Auto-diagnostic - Retour de congés
              </h3>
              <p className="text-gray-600 mb-6">Évaluez votre ressenti après votre période d'absence</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questionnaireSections.map((section) => (
                  <Card key={section.id} className={`p-4 border-2 ${section.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{section.title}</h4>
                      {section.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{section.questions} questions</span>
                        <span className={section.completed ? 'text-green-600' : 'text-gray-500'}>
                          {section.completed ? `${section.score}/${section.maxScore}` : 'Non commencé'}
                        </span>
                      </div>
                      
                      {section.completed && (
                        <Progress 
                          value={(section.score / section.maxScore) * 100} 
                          className="h-1"
                        />
                      )}
                      
                      <Button 
                        size="sm" 
                        variant={section.completed ? 'secondary' : 'default'}
                        className="w-full mt-3"
                      >
                        {section.completed ? 'Réviser' : 'Commencer'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Progression globale</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sections complétées: 2/4</span>
                  <span>50%</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="historique" className="space-y-6">
            <div className="space-y-4">
              {diagnosticResults.map((result) => (
                <Card key={result.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-gray-600">{result.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{result.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score obtenu</span>
                        <span className={getScoreColor(result.score, result.maxScore)}>
                          {result.score}/{result.maxScore}
                        </span>
                      </div>
                      <Progress 
                        value={(result.score / result.maxScore) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommandations:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Target className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommandations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Points forts à maintenir
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Excellent équilibre vie pro/perso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Relations harmonieuses avec l'équipe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Motivation et engagement élevés</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Axes d'amélioration
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Améliorer la qualité du sommeil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gérer le stress en fin de journée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Planifier des pauses plus régulières</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 col-span-full">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Plan d'action personnalisé
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Cette semaine</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Routine de coucher à 22h</li>
                      <li>• 5 min de méditation quotidienne</li>
                      <li>• Pauses de 10 min toutes les 2h</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Ce mois</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Rejoindre le groupe sport entreprise</li>
                      <li>• Organiser 2 pauses café équipe</li>
                      <li>• Évaluation mi-parcours</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Long terme</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Formation gestion du stress</li>
                      <li>• Aménagement poste de travail</li>
                      <li>• Bilan trimestriel complet</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SanteDiagnosticDashboard;
