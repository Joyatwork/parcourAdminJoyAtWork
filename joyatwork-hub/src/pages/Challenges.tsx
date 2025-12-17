import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Plus, 
  Filter, 
  Target,
  Users,
  Award,
  Clock,
  TrendingUp,
  TrendingDown,
  Edit,
  BarChart3
} from "lucide-react";

const challengesData = [
  {
    id: 1,
    title: "Méditation 5 minutes",
    description: "Prenez 5 minutes pour méditer et vous recentrer",
    category: "Bien-être",
    points: 50,
    duration: "5 min",
    participants: 234,
    completionRate: 78,
    status: "Actif",
    statusColor: "bg-green-100 text-green-800"
  },
  {
    id: 2,
    title: "Pause déjeuner sans écran",
    description: "Déjeunez sans regarder votre téléphone ou ordinateur",
    category: "Digital detox",
    points: 30,
    duration: "30 min",
    participants: 0,
    completionRate: 0,
    status: "Brouillon",
    statusColor: "bg-yellow-100 text-yellow-800"
  }
];

export default function Challenges() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous les statuts");

  const statsCards = [
    {
      title: "Défis actifs",
      value: "24",
      subtitle: "+12% vs mois dernier",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up"
    },
    {
      title: "Participation",
      value: "87%",
      subtitle: "+5% taux de complétion",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up"
    },
    {
      title: "Points distribués",
      value: "12,450",
      subtitle: "0% ce mois-ci",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "neutral"
    },
    {
      title: "Temps moyen",
      value: "8min",
      subtitle: "-15% par défi complété",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "down"
    }
  ];

  const getStatusBadge = (status: string, statusColor: string) => {
    return <Badge className={statusColor}>{status}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Défis gamifiés</h1>
        <p className="text-gray-600">Gérez et suivez les défis bien-être de vos utilisateurs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-6 border-0 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {getTrendIcon(stat.trend)}
                </div>
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un défi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous les statuts">Tous les statuts</SelectItem>
              <SelectItem value="Actif">Actif</SelectItem>
              <SelectItem value="Brouillon">Brouillon</SelectItem>
              <SelectItem value="Terminé">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-700 border-gray-300">
            <Plus className="w-4 h-4 mr-2" />
            Créer une séance immersive
          </Button>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau défi
          </Button>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {challengesData.map((challenge) => (
          <Card key={challenge.id} className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {challenge.title}
                  </h3>
                  {getStatusBadge(challenge.status, challenge.statusColor)}
                </div>
                
                <p className="text-gray-600 mb-4">
                  {challenge.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{challenge.category}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Points</p>
                    <p className="font-semibold text-gray-900">{challenge.points} points</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Durée</p>
                    <p className="font-semibold text-gray-900">{challenge.duration}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Participants</p>
                    <p className="font-semibold text-gray-900">{challenge.participants} participants</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Taux de complétion</p>
                    <div className="flex items-center gap-2">
                      <Progress value={challenge.completionRate} className="flex-1" />
                      <span className="text-sm font-semibold text-gray-900">{challenge.completionRate}% complété</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-6">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Statistiques
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State for more challenges */}
      {challengesData.length === 2 && (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun autre défi pour le moment</p>
          <p className="text-sm">Créez un nouveau défi pour engager vos utilisateurs</p>
        </div>
      )}
    </div>
  );
}
