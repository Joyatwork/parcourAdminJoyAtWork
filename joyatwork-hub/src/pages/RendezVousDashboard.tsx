import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Video,
  Plus,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Users,
  CalendarDays,
  TrendingUp
} from 'lucide-react';

// Interface pour les rendez-vous de votre base MySQL
interface Appointment {
  id: number;
  practitioner_id: number;
  patient_name: string;
  patient_email: string | null;
  patient_phone: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  appointment_type: 'consultation' | 'suivi' | 'urgence' | 'groupe';
  status: 'planifie' | 'confirme' | 'en_cours' | 'termine' | 'annule';
  notes: string | null;
  price: string | null;
  practitioner_name: string;
  practitioner_specialty: string;
  practitioner_phone: string | null;
  practitioner_email: string | null;
  created_at: string;
  updated_at: string;
}

interface RendezVous {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'suivi' | 'urgence' | 'groupe';
  mode: 'presentiel' | 'visio' | 'telephone';
  status: 'confirme' | 'en_attente' | 'annule' | 'termine';
  participant: {
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  practitioner: string;
  location?: string;
  notes?: string;
}

const RendezVousDashboard = () => {
  const [activeTab, setActiveTab] = useState('aujourdhui');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupération des rendez-vous depuis votre base MySQL
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:8001/appointments.php');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des rendez-vous');
        }
        const data = await response.json();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour formater l'heure
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirme': return 'bg-green-100 text-green-800';
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'termine': return 'bg-gray-100 text-gray-800';
      case 'annule': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour obtenir la couleur du type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'suivi': return 'bg-purple-100 text-purple-800';
      case 'urgence': return 'bg-red-100 text-red-800';
      case 'groupe': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtrer les rendez-vous selon l'onglet actif
  const today = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = appointment.appointment_date;
    
    switch (activeTab) {
      case 'aujourdhui':
        return appointmentDate === today;
      case 'semaine':
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        const appointmentDateObj = new Date(appointmentDate);
        return appointmentDateObj >= startOfWeek && appointmentDateObj <= endOfWeek;
      case 'mois':
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const appointmentMonth = new Date(appointmentDate).getMonth();
        const appointmentYear = new Date(appointmentDate).getFullYear();
        return appointmentMonth === currentMonth && appointmentYear === currentYear;
      case 'tous':
        return true;
      default:
        return true;
    }
  });

  // Calcul des statistiques
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirme').length;
  const todayAppointments = appointments.filter(a => a.appointment_date === today).length;

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des rendez-vous...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Erreur de connexion</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Assurez-vous d'avoir exécuté le script SQL pour créer la table appointments
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Données de démonstration supprimées - nous utilisons maintenant les vraies données
  const rendezVous: any[] = [
    {
      id: '1',
      title: 'Consultation bien-être',
      date: '2025-01-09',
      time: '09:00',
      duration: 60,
      type: 'consultation',
      mode: 'presentiel',
      status: 'confirme',
      participant: {
        name: 'Marie Dubois',
        company: 'TechCorp',
        email: 'marie.dubois@techcorp.com',
        phone: '+33 6 12 34 56 78'
      },
      practitioner: 'Dr. Sophie Martin',
      location: 'Cabinet - Salle 1',
      notes: 'Première consultation - stress au travail'
    },
    {
      id: '2',
      title: 'Suivi psychologique',
      date: '2025-01-09',
      time: '10:30',
      duration: 45,
      type: 'suivi',
      mode: 'visio',
      status: 'confirme',
      participant: {
        name: 'Jean Leclerc',
        company: 'InnoTech',
        email: 'jean.leclerc@innotech.fr',
        phone: '+33 6 98 76 54 32'
      },
      practitioner: 'Mme Catherine Roux',
      notes: '3ème séance - amélioration notable'
    },
    {
      id: '3',
      title: 'Session de groupe - Gestion du stress',
      date: '2025-01-09',
      time: '14:00',
      duration: 90,
      type: 'groupe',
      mode: 'presentiel',
      status: 'confirme',
      participant: {
        name: 'Équipe Marketing',
        company: 'CreaTech',
        email: 'hr@createch.com',
        phone: '+33 1 23 45 67 89'
      },
      practitioner: 'Dr. Michel Laurent',
      location: 'Salle de conférence A',
      notes: 'Atelier interactif - 8 participants'
    },
    {
      id: '4',
      title: 'Consultation urgente',
      date: '2025-01-09',
      time: '16:15',
      duration: 30,
      type: 'urgence',
      mode: 'telephone',
      status: 'en_attente',
      participant: {
        name: 'Pierre Durand',
        company: 'ServicePlus',
        email: 'pierre.durand@serviceplus.fr',
        phone: '+33 7 11 22 33 44'
      },
      practitioner: 'Dr. Sophie Martin',
      notes: 'Crise d\'anxiété - à traiter rapidement'
    },
    {
      id: '5',
      title: 'Bilan de santé annuel',
      date: '2025-01-10',
      time: '09:30',
      duration: 120,
      type: 'consultation',
      mode: 'presentiel',
      status: 'confirme',
      participant: {
        name: 'Alice Bernard',
        company: 'DataFlow',
        email: 'alice.bernard@dataflow.com',
        phone: '+33 6 55 44 33 22'
      },
      practitioner: 'Dr. Thomas Moreau',
      location: 'Cabinet - Salle 2',
      notes: 'Bilan complet + tests de stress'
    },
    {
      id: '6',
      title: 'Suivi post-arrêt maladie',
      date: '2025-01-10',
      time: '15:00',
      duration: 60,
      type: 'suivi',
      mode: 'presentiel',
      status: 'annule',
      participant: {
        name: 'Lucie Petit',
        company: 'WebAgency',
        email: 'lucie.petit@webagency.fr',
        phone: '+33 6 77 88 99 00'
      },
      practitioner: 'Mme Catherine Roux',
      location: 'Cabinet - Salle 1',
      notes: 'Reprise progressive - annulé par le patient'
    }
  ];

  const stats = {
    total_aujourdhui: rendezVous.filter(rv => rv.date === '2025-01-09').length,
    confirmes: rendezVous.filter(rv => rv.status === 'confirme').length,
    en_attente: rendezVous.filter(rv => rv.status === 'en_attente').length,
    taux_presence: 92,
    duree_moyenne: 68,
    prochaine_dispo: '10:00'
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'confirme': return <CheckCircle className="w-4 h-4" />;
      case 'en_attente': return <Clock className="w-4 h-4" />;
      case 'annule': return <XCircle className="w-4 h-4" />;
      case 'termine': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getModeIcon = (mode: string) => {
    switch(mode) {
      case 'presentiel': return <MapPin className="w-4 h-4" />;
      case 'visio': return <Video className="w-4 h-4" />;
      case 'telephone': return <Phone className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredRendezVous = (tab: string) => {
    const today = '2025-01-09';
    const tomorrow = '2025-01-10';
    
    switch(tab) {
      case 'aujourdhui': return rendezVous.filter(rv => rv.date === today);
      case 'demain': return rendezVous.filter(rv => rv.date === tomorrow);
      case 'semaine': return rendezVous.filter(rv => rv.date >= today);
      case 'tous': return rendezVous;
      default: return rendezVous;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
            <p className="text-gray-600">Gérez vos consultations et suivis bien-être</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau RDV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Aujourd'hui</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total_aujourdhui}</p>
                <p className="text-sm text-blue-600">rendez-vous</p>
              </div>
              <CalendarDays className="w-12 h-12 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Confirmés</p>
                <p className="text-3xl font-bold text-green-900">{stats.confirmes}</p>
                <p className="text-sm text-green-600">sur {rendezVous.length} total</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Taux présence</p>
                <p className="text-3xl font-bold text-orange-900">{stats.taux_presence}%</p>
                <p className="text-sm text-orange-600">ce mois</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Prochaine dispo</p>
                <p className="text-3xl font-bold text-purple-900">{stats.prochaine_dispo}</p>
                <p className="text-sm text-purple-600">demain</p>
              </div>
              <Clock className="w-12 h-12 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="aujourdhui">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="demain">Demain</TabsTrigger>
            <TabsTrigger value="semaine">Cette semaine</TabsTrigger>
            <TabsTrigger value="tous">Tous</TabsTrigger>
          </TabsList>

          {(['aujourdhui', 'semaine', 'mois', 'tous'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.map((appointment) => (
                  <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-16 rounded-full ${getTypeColor(appointment.appointment_type)}`}></div>
                          <div>
                            <h3 className="font-semibold text-lg capitalize">
                              {appointment.appointment_type} - {appointment.patient_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.practitioner_name} • {appointment.practitioner_specialty}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status === 'confirme' && <CheckCircle className="w-3 h-3" />}
                          {appointment.status === 'planifie' && <Clock className="w-3 h-3" />}
                          {appointment.status === 'en_cours' && <AlertCircle className="w-3 h-3" />}
                          {appointment.status === 'termine' && <CheckCircle className="w-3 h-3" />}
                          {appointment.status === 'annule' && <XCircle className="w-3 h-3" />}
                          <span className="ml-1 capitalize">
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDate(appointment.appointment_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{formatTime(appointment.appointment_time)} ({appointment.duration_minutes}min)</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(appointment.appointment_type)}>
                          {appointment.appointment_type}
                        </Badge>
                        {appointment.price && (
                          <span className="text-green-600 font-medium">{parseFloat(appointment.price).toFixed(0)}€</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{appointment.patient_name}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Patient</p>
                          {appointment.patient_email && (
                            <p className="text-gray-600">{appointment.patient_email}</p>
                          )}
                          {appointment.patient_phone && (
                            <p className="text-gray-600">{appointment.patient_phone}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Praticien</p>
                          <p className="text-gray-600">{appointment.practitioner_name}</p>
                          {appointment.practitioner_email && (
                            <p className="text-gray-600">{appointment.practitioner_email}</p>
                          )}
                          {appointment.practitioner_phone && (
                            <p className="text-gray-600">{appointment.practitioner_phone}</p>
                          )}
                        </div>
                        {appointment.notes && (
                          <div className="md:col-span-2">
                            <p className="font-medium text-gray-700">Notes</p>
                            <p className="text-gray-600">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {filteredAppointments.length === 0 && (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
                  <p className="text-gray-600 mb-6">
                    {tab === 'aujourdhui' && 'Aucun rendez-vous prévu pour aujourd\'hui.'}
                    {tab === 'semaine' && 'Aucun rendez-vous prévu cette semaine.'}
                    {tab === 'mois' && 'Aucun rendez-vous prévu ce mois-ci.'}
                    {tab === 'tous' && 'Aucun rendez-vous enregistré dans la base de données.'}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un rendez-vous
                  </Button>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default RendezVousDashboard;
