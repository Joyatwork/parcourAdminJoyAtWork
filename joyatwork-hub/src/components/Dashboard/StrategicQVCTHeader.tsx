import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Bell, 
  Shield, 
  Award, 
  TrendingUp,
  CheckCircle,
  Star,
  X
} from "lucide-react";

const complianceMetrics = [
  { label: "Conformité réglementaire", value: 94, status: "excellent" },
  { label: "Maturité QVCT", value: 87, status: "avancé" },
  { label: "Certification ISO 45001", value: 100, status: "certifié" }
];

export function StrategicQVCTHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  const notifications = [
    {
      id: 1,
      title: "Audit QVCT planifié",
      message: "Audit de conformité prévu le 15 novembre 2024",
      type: "info",
      time: "Il y a 2h"
    },
    {
      id: 2,
      title: "Certification ISO renouvelée",
      message: "Félicitations ! Votre certification ISO 45001 a été renouvelée avec succès",
      type: "success", 
      time: "Il y a 1 jour"
    },
    {
      id: 3,
      title: "Nouvel indicateur disponible",
      message: "Indicateur de bien-être mental ajouté au tableau de bord",
      type: "update",
      time: "Il y a 3 jours"
    }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = () => {
    setNotificationCount(0);
  };

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-primary rounded-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">
                Tableau de bord Joyatwork
              </h1>
              <Badge className="bg-gradient-wellness text-white px-3 py-1">
                <Star className="w-4 h-4 mr-1" />
                Outil N°1 Pilotage Stratégique QVCT
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Plateforme référence de santé préventive et bien-être au travail
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Certifié Référence Sectorielle
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
                <Shield className="w-3 h-3 mr-1" />
                Conformité Réglementaire 100%
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-gradient-wellness text-white px-4 py-2">
            <Activity className="w-4 h-4 mr-1" />
            Système Actif
          </Badge>
          <div className="relative">
            <Button variant="outline" size="sm" onClick={handleNotificationClick}>
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {notificationCount}
                </Badge>
              )}
            </Button>
            
            {/* Panel de notifications */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      Marquer comme lu
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCloseNotifications}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'info' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-foreground">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t text-center">
                  <Button variant="ghost" size="sm" className="text-xs">
                    Voir toutes les notifications
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Strategic Compliance Metrics */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Indicateurs Stratégiques de Conformité QVCT
          </h3>
          <Badge className="bg-gradient-primary text-white">
            Audit 2024 ✓
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {complianceMetrics.map((metric, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {metric.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-700">
                    {metric.value}%
                  </span>
                  {metric.status === "certifié" && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              <Progress 
                value={metric.value} 
                className="h-3 bg-blue-100"
              />
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-700 font-medium">
                  {metric.status === "excellent" ? "Performance Excellente" :
                   metric.status === "avancé" ? "Niveau Avancé Confirmé" :
                   "Certification Obtenue"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-foreground">
                Reconnaissance Sectorielle
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>• Label Qualité QVCT Référence</span>
              <span>• Benchmark Top 5% du secteur</span>
              <span>• Certification ISO 45001 renouvelée</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}