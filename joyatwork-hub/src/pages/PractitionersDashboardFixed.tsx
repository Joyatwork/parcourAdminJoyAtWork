import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Calendar, Users, Plus, AlertCircle, Edit, Trash2 } from 'lucide-react';

interface Practitioner {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  speciality: string;
  location: string | null;
  created_at: string;
  updated_at: string;
}

interface NewPractitioner {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  experience_years: string;
  rating: string;
  certifications: string;
  availability: string;
  bio: string;
}

interface Appointment {
  id: number;
  user_id: number;
  specialist_id: number;
  scheduled_at: string;
  type: string;
  status: string;
  price_cents: number;
  price_euros: number;
  notes?: string;
  specialist_name: string;
  specialist_email?: string;
  specialist_phone?: string;
  date: string;
  time: string;
}

export default function PractitionersDashboard() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [activeTab, setActiveTab] = useState('practitioners');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPractitioner, setEditingPractitioner] = useState<Practitioner | null>(null);
  
  // États pour les rendez-vous
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  
  const [newPractitioner, setNewPractitioner] = useState<NewPractitioner>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    experience_years: '',
    rating: '',
    certifications: '',
    availability: '',
    bio: ''
  });

  // Fonction pour supprimer un praticien
  const handleDeletePractitioner = async (practitionerId: number, practitionerName: string) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${practitionerName} ?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/delete_practitioner.php?id=${practitionerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${practitionerName} a été supprimé avec succès !`);
        // Recharger la liste des praticiens
        const refreshResponse = await fetch('http://localhost:8080/practitioners-real.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setPractitioners(refreshData.data);
        }
      } else {
        alert(`Erreur lors de la suppression : ${data.error || data.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur de connexion lors de la suppression');
    }
  };

  // Fonction pour ouvrir le dialog de modification
  const handleEditPractitioner = (practitioner: Practitioner) => {
    setEditingPractitioner(practitioner);
    setIsEditDialogOpen(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleUpdatePractitioner = async () => {
    if (!editingPractitioner) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:8080/update_practitioner.php?id=${editingPractitioner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingPractitioner.name,
          email: editingPractitioner.email,
          phone: editingPractitioner.phone,
          specialty: editingPractitioner.speciality,
          location: editingPractitioner.location
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Praticien modifié avec succès !');
        setIsEditDialogOpen(false);
        setEditingPractitioner(null);
        
        // Recharger la liste
        const refreshResponse = await fetch('http://localhost:8080/practitioners-real.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setPractitioners(refreshData.data);
        }
      } else {
        alert(`Erreur lors de la modification : ${data.error || data.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur de connexion lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadPractitioners = async () => {
      try {
        console.log('Tentative de connexion à l\'API...');
        const response = await fetch('http://localhost:8080/practitioners-real.php');
        console.log('Réponse reçue:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Données reçues:', data);
        
        if (data.success) {
          setPractitioners(data.data);
        } else {
          throw new Error(data.message || 'Erreur lors du chargement');
        }
      } catch (error) {
        console.error('Erreur complète:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch - Vérifiez que le serveur API fonctionne sur le port 8002');
      } finally {
        setLoading(false);
      }
    };

    const loadAppointments = async () => {
      try {
        setAppointmentsLoading(true);
        const response = await fetch('http://localhost:8080/appointments.php');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAppointments(data.data);
        } else {
          throw new Error(data.error || 'Erreur lors du chargement des rendez-vous');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des rendez-vous:', error);
        setAppointmentsError(error instanceof Error ? error.message : 'Erreur de connexion');
      } finally {
        setAppointmentsLoading(false);
      }
    };

    loadPractitioners();
    loadAppointments();
  }, []);

  const handleAddPractitioner = async () => {
    if (!newPractitioner.first_name || !newPractitioner.last_name || !newPractitioner.email) {
      alert('Veuillez remplir tous les champs obligatoires (Prénom, Nom, Email)');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Envoi des données:', newPractitioner);
      const response = await fetch('http://localhost:8080/add_practitioner.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPractitioner),
      });

      console.log('Statut de la réponse:', response.status);
      const data = await response.json();
      console.log('Réponse complète:', data);
      
      if (data.success) {
        alert('Praticien ajouté avec succès!');
        setNewPractitioner({
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          experience_years: '',
          rating: '',
          certifications: '',
          availability: '',
          bio: ''
        });
        setIsDialogOpen(false);
        
        // Recharger la liste
        const refreshResponse = await fetch('http://localhost:8080/practitioners-real.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setPractitioners(refreshData.data);
        }
      } else {
        alert(`Erreur: ${data.error || data.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du praticien');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPractitioners = practitioners.filter(practitioner => {
    const fullName = `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || practitioner.name || '';
    // Gestion des deux variantes : specialty et speciality
    const speciality = practitioner.speciality || practitioner.specialty || '';
    const email = practitioner.email || '';
    const certifications = practitioner.certifications || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certifications.toLowerCase().includes(searchTerm.toLowerCase());
                         
    // Gestion des deux variantes pour le filtre de spécialité
    const practitionerSpecialty = practitioner.speciality || practitioner.specialty || '';
    const matchesSpecialty = selectedSpecialty === 'all' || practitionerSpecialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const uniqueSpecialties = [...new Set(practitioners.map(p => p.speciality || p.specialty || 'Non spécifié').filter(s => s))];

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
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-left">
            <p className="text-sm text-yellow-700">
              <strong>Solutions possibles :</strong>
            </p>
            <ul className="text-sm text-yellow-600 mt-2 list-disc list-inside">
              <li>Vérifiez que le serveur API PHP est démarré sur le port 8080</li>
              <li>Redémarrez le serveur avec : <code>php -S localhost:8080 -t api</code></li>
              <li>Vérifiez la connexion à la base de données MySQL</li>
            </ul>
          </div>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Praticiens</h1>
              <p className="text-gray-600 mt-2">Gérez votre équipe de praticiens</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{practitioners.length}</div>
                <div className="text-sm text-blue-600">Praticiens</div>
              </div>
              <div className="bg-purple-50 px-4 py-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{uniqueSpecialties.length}</div>
                <div className="text-sm text-purple-600">Spécialités</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

          <TabsContent value="practitioners" className="space-y-4">
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
                      Remplissez les informations du nouveau praticien.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                    <div>
                      <Label htmlFor="first_name">Prénom *</Label>
                      <Input
                        id="first_name"
                        value={newPractitioner.first_name}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Marie"
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom *</Label>
                      <Input
                        id="last_name"
                        value={newPractitioner.last_name}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Dupont"
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
                      <Label htmlFor="experience_years">Années d'expérience</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        value={newPractitioner.experience_years}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, experience_years: e.target.value }))}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rating">Note (1-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={newPractitioner.rating}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, rating: e.target.value }))}
                        placeholder="4.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="certifications">Certifications</Label>
                      <Input
                        id="certifications"
                        value={newPractitioner.certifications}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, certifications: e.target.value }))}
                        placeholder="Psychologue clinicien, Thérapeute cognitivo-comportemental"
                      />
                    </div>
                    <div>
                      <Label htmlFor="availability">Disponibilité</Label>
                      <Input
                        id="availability"
                        value={newPractitioner.availability}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, availability: e.target.value }))}
                        placeholder="Lundi-Vendredi 9h-17h"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Biographie</Label>
                      <textarea
                        id="bio"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newPractitioner.bio}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Décrivez votre parcours professionnel et votre approche thérapeutique..."
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

            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="text-sm text-gray-600">
                  {filteredPractitioners.length} praticien{filteredPractitioners.length > 1 ? 's' : ''}
                </div>
              </div>

              <div className="p-6">
                {filteredPractitioners.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Aucun praticien trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPractitioners.map((practitioner) => (
                      <Card key={practitioner.id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold mb-1">
                                {practitioner.first_name && practitioner.last_name 
                                  ? `${practitioner.first_name} ${practitioner.last_name}`
                                  : practitioner.name || 'Nom non spécifié'
                                }
                              </CardTitle>
                              <div className="flex gap-2 mb-3">
                                {practitioner.rating && (
                                  <Badge variant="outline">
                                    ⭐ {practitioner.rating}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleEditPractitioner(practitioner)}
                                title="Modifier ce praticien"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeletePractitioner(practitioner.id, `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || practitioner.name || 'ce praticien')}
                                className="text-red-600 hover:text-red-700"
                                title="Supprimer ce praticien"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            {practitioner.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{practitioner.email}</span>
                              </div>
                            )}
                            {practitioner.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{practitioner.phone}</span>
                              </div>
                            )}
                            {practitioner.experience_years && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-blue-600">📚</span>
                                <span>{practitioner.experience_years} ans d'expérience</span>
                              </div>
                            )}
                            {practitioner.certifications && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-green-600">🏆</span>
                                <span className="truncate" title={practitioner.certifications}>
                                  {practitioner.certifications}
                                </span>
                              </div>
                            )}
                            {practitioner.availability && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-orange-600">🕐</span>
                                <span className="truncate" title={practitioner.availability}>
                                  {practitioner.availability}
                                </span>
                              </div>
                            )}
                            {practitioner.bio && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-700">
                                <p className="line-clamp-2" title={practitioner.bio}>
                                  {practitioner.bio}
                                </p>
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

          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Rendez-vous</h2>
            </div>

            {appointmentsError && (
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{appointmentsError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b">
                <div className="text-sm text-gray-600">
                  {appointments.length} rendez-vous
                </div>
              </div>

              <div className="p-6">
                {appointmentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Chargement des rendez-vous...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h3>
                    <p className="text-gray-600">
                      Aucun rendez-vous programmé pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold mb-2">
                                RDV #{appointment.id} - {appointment.specialist_name || 'Praticien non assigné'}
                              </CardTitle>
                              <div className="flex gap-3 mb-3">
                                <Badge variant={
                                  appointment.status === 'confirmed' ? 'default' : 
                                  appointment.status === 'cancelled' ? 'destructive' : 
                                  'secondary'
                                }>
                                  {appointment.status === 'confirmed' ? 'Confirmé' :
                                   appointment.status === 'cancelled' ? 'Annulé' :
                                   appointment.status}
                                </Badge>
                                <Badge variant="outline">
                                  {appointment.type === 'video' ? '📹 Vidéo' :
                                   appointment.type === 'phone' ? '📞 Téléphone' :
                                   '🏢 Présentiel'}
                                </Badge>
                                {appointment.price_euros > 0 && (
                                  <Badge variant="secondary">
                                    💰 {appointment.price_euros}€
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date} à {appointment.time}</span>
                            </div>
                            {appointment.specialist_email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span>{appointment.specialist_email}</span>
                              </div>
                            )}
                            {appointment.specialist_phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4" />
                                <span>{appointment.specialist_phone}</span>
                              </div>
                            )}
                            {appointment.notes && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-700">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
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
        </Tabs>
      </div>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le praticien</DialogTitle>
            <DialogDescription>
              Modifiez les informations du praticien.
            </DialogDescription>
          </DialogHeader>
          
          {editingPractitioner && (
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              <div>
                <Label htmlFor="edit-first-name">Prénom <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-first-name"
                  value={editingPractitioner.first_name || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, first_name: e.target.value } : null
                  )}
                  placeholder="Marie"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-last-name">Nom <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-last-name"
                  value={editingPractitioner.last_name || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, last_name: e.target.value } : null
                  )}
                  placeholder="Dupont"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={editingPractitioner.phone || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, phone: e.target.value } : null
                  )}
                  placeholder="01 23 45 67 89"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingPractitioner.email || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, email: e.target.value } : null
                  )}
                  placeholder="marie.dupont@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-experience-years">Années d'expérience</Label>
                <Input
                  id="edit-experience-years"
                  type="number"
                  value={editingPractitioner.experience_years || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, experience_years: e.target.value } : null
                  )}
                  placeholder="5"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-rating">Note (1-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={editingPractitioner.rating || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, rating: e.target.value } : null
                  )}
                  placeholder="4.5"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-certifications">Certifications</Label>
                <Input
                  id="edit-certifications"
                  value={editingPractitioner.certifications || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, certifications: e.target.value } : null
                  )}
                  placeholder="Psychologue clinicien, Thérapeute cognitivo-comportemental"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-availability">Disponibilité</Label>
                <Input
                  id="edit-availability"
                  value={editingPractitioner.availability || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, availability: e.target.value } : null
                  )}
                  placeholder="Lundi-Vendredi 9h-17h"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-bio">Biographie</Label>
                <textarea
                  id="edit-bio"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingPractitioner.bio || ''}
                  onChange={(e) => setEditingPractitioner(prev => 
                    prev ? { ...prev, bio: e.target.value } : null
                  )}
                  placeholder="Décrivez votre parcours professionnel et votre approche thérapeutique..."
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingPractitioner(null);
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleUpdatePractitioner}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
