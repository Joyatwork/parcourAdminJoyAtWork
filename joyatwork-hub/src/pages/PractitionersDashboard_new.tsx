import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Phone, Mail, Star, Calendar, Clock, CheckCircle, Users, Bell, Activity, StarIcon, Plus, AlertCircle, XCircle, User, Edit, Trash2 } from 'lucide-react';

// Interface pour les praticiens de votre base MySQL
interface Practitioner {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  location: string | null;
  created_at: string;
  updated_at: string;
  experience_years?: number;
  rating?: string;
  certifications?: string;
  availability?: string;
  bio?: string;
  verified?: number;
}

// Interface pour les rendez-vous
interface Appointment {
  id: number;
  practitioner_id: number;
  practitioner_name: string;
  practitioner_specialty: string;
  practitioner_email: string | null;
  practitioner_phone: string | null;
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
  created_at: string;
  updated_at: string;
}

// Interface pour les nouveaux praticiens
interface NewPractitioner {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  location: string;
  bio?: string;
}

export default function PractitionersDashboard() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [activeTab, setActiveTab] = useState('practitioners');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État pour le nouveau praticien
  const [newPractitioner, setNewPractitioner] = useState<NewPractitioner>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    location: '',
    bio: ''
  });

  // Charger les praticiens
  useEffect(() => {
    const loadPractitioners = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/practitioners.php');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setPractitioners(data.data);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadPractitioners();
  }, []);

  // Charger les rendez-vous
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/appointments.php');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setAppointments(data.data || []);
        } else {
          throw new Error(data.message || 'Table appointments non trouvée');
        }
      } catch (error) {
        console.error('Erreur appointments:', error);
        setAppointmentsError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // Fonction pour ajouter un nouveau praticien
  const handleAddPractitioner = async () => {
    if (!newPractitioner.name || !newPractitioner.email || !newPractitioner.specialty) {
      alert('Veuillez remplir tous les champs obligatoires (nom, email, spécialité)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8001/api/add_practitioner.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPractitioner),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Praticien ajouté avec succès!');
        // Réinitialiser le formulaire
        setNewPractitioner({
          name: '',
          email: '',
          phone: '',
          specialty: '',
          location: '',
          bio: ''
        });
        setIsDialogOpen(false);
        
        // Recharger la liste des praticiens
        const refreshResponse = await fetch('http://localhost:8001/api/practitioners.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setPractitioners(refreshData.data);
        }
      } else {
        alert(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du praticien');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonctions pour les actions sur les praticiens
  const handleEditPractitioner = (practitioner: Practitioner) => {
    alert(`Modifier ${practitioner.name} (fonctionnalité à implémenter)`);
  };

  const handleDeletePractitioner = (practitioner: Practitioner) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${practitioner.name} ?`)) {
      alert(`Suppression de ${practitioner.name} (fonctionnalité à implémenter)`);
    }
  };

  // Fonctions pour les actions sur les rendez-vous
  const handleEditAppointment = (appointment: Appointment) => {
    alert(`Modifier le rendez-vous de ${appointment.patient_name} (fonctionnalité à implémenter)`);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous de ${appointment.patient_name} ?`)) {
      alert(`Suppression du rendez-vous (fonctionnalité à implémenter)`);
    }
  };

  const handleCreateAppointment = () => {
    alert('Créer un nouveau rendez-vous (fonctionnalité à implémenter)');
  };

  // Filtrage des praticiens
  const filteredPractitioners = practitioners.filter(practitioner => {
    const matchesSearch = practitioner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practitioner.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (practitioner.location && practitioner.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty = selectedSpecialty === 'all' || practitioner.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  // Obtenir les spécialités uniques
  const uniqueSpecialties = [...new Set(practitioners.map(p => p.specialty))];

  // Fonctions utilitaires pour les rendez-vous
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'suivi': return 'bg-green-100 text-green-800';
      case 'urgence': return 'bg-red-100 text-red-800';
      case 'groupe': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des praticiens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec statistiques */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Praticiens</h1>
              <p className="text-gray-600 mt-2">Gérez votre équipe de praticiens et leurs rendez-vous</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{practitioners.length}</div>
                <div className="text-sm text-blue-600">Praticiens</div>
              </div>
              <div className="bg-green-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{appointments.length}</div>
                <div className="text-sm text-green-600">Rendez-vous</div>
              </div>
              <div className="bg-purple-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{uniqueSpecialties.length}</div>
                <div className="text-sm text-purple-600">Spécialités</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec onglets */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="practitioners">
              <Users className="w-4 h-4 mr-2" />
              Praticiens
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Rendez-vous
            </TabsTrigger>
          </TabsList>

          {/* Onglet Praticiens */}
          <TabsContent value="practitioners" className="space-y-4">
            {/* Actions et filtres */}
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 flex-1">
                <Input
                  placeholder="Rechercher un praticien..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les spécialités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialités</SelectItem>
                    {uniqueSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un praticien
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau praticien</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations du nouveau praticien ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        value={newPractitioner.name}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Dr. Marie Dupont"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPractitioner.email}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="marie.dupont@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={newPractitioner.phone}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Spécialité *</Label>
                      <Input
                        id="specialty"
                        value={newPractitioner.specialty}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, specialty: e.target.value }))}
                        placeholder="Ex: Psychologue, Kiné, Médecin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={newPractitioner.location}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ex: Paris 12ème, Lyon Centre"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biographie</Label>
                      <Textarea
                        id="bio"
                        value={newPractitioner.bio}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Présentation du praticien..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddPractitioner} disabled={isSubmitting}>
                      {isSubmitting ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Affichage des résultats */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="text-sm text-gray-600">
                  {filteredPractitioners.length} praticien{filteredPractitioners.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* Liste des praticiens */}
              <div className="p-6">
                {filteredPractitioners.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aucun praticien ne correspond à votre recherche</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setSearchTerm('')}
                    >
                      Voir tous les praticiens
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPractitioners.map((practitioner) => (
                      <Card key={practitioner.id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                {practitioner.name}
                              </CardTitle>
                              <Badge className="mb-3" variant="secondary">
                                {practitioner.specialty}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditPractitioner(practitioner)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeletePractitioner(practitioner)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {practitioner.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{practitioner.email}</span>
                              </div>
                            )}
                            {practitioner.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{practitioner.phone}</span>
                              </div>
                            )}
                            {practitioner.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{practitioner.location}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Rendez-vous</h2>
              <Button onClick={handleCreateAppointment}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un rendez-vous
              </Button>
            </div>
            
            {appointmentsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des rendez-vous...</p>
              </div>
            ) : appointmentsError ? (
              <div className="text-center py-12">
                <p className="text-red-600">{appointmentsError}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Vérifiez que la table appointments existe dans votre base MySQL
                </p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
                <p className="text-gray-600 mb-6">
                  Aucun rendez-vous enregistré dans la base de données.
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 mb-4"
                  onClick={handleCreateAppointment}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un rendez-vous
                </Button>
                <p className="text-sm text-gray-500">
                  Ou exécutez le script SQL appointments_setup.sql pour créer des données d'exemple.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-16 rounded-full bg-blue-500`}></div>
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
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditAppointment(appointment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteAppointment(appointment)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
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

                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-700 mb-1">Notes</p>
                          <p className="text-gray-600 text-sm">{appointment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
