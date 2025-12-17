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

// Données mises à jour - 14 praticiens de votre base MySQL
const testPractitioners = [
  {
    id: 1,
    name: "Dr. Marie Dubois",
    speciality: "Psychologue du travail",
    location: "Paris, France",
    phone: "+33142345678",
    email: "marie.dubois@example.com",
    experience_years: 8,
    rating: "4.8",
    certifications: "Psychologue clinicienne",
    availability: "Disponible",
    bio: "Spécialiste en bien-être au travail",
    verified: 1,
    status: "actif"
  },
  {
    id: 2,
    name: "Dr. Sophie Martin",
    speciality: "Psychologue du travail", 
    location: "Lyon, France",
    phone: "+33478901234",
    email: "sophie.martin@example.com",
    experience_years: 12,
    rating: "4.9",
    certifications: "Psychologue clinicienne, Coach certifiée",
    availability: "Disponible",
    bio: "Experte en bien-être au travail avec plus de 12 ans d'expérience",
    verified: 1,
    status: "actif"
  },
  {
    id: 3,
    name: "Dr. Antoine Rousseau",
    speciality: "Thérapeute holistique",
    location: "Marseille, France", 
    phone: "+33491234567",
    email: "antoine.rousseau@example.com",
    experience_years: 8,
    rating: "4.7",
    certifications: "Thérapeute en médecines alternatives",
    availability: "Disponible", 
    bio: "Spécialiste en sophrologie et gestion du stress professionnel",
    verified: 1,
    status: "actif"
  },
  {
    id: 4,
    name: "Dr. Claire Lemoine",
    speciality: "Coach en entreprise",
    location: "Nantes, France",
    phone: "+33240567890", 
    email: "claire.lemoine@example.com",
    experience_years: 15,
    rating: "4.8",
    certifications: "Coach professionnelle certifiée ICF",
    availability: "Disponible",
    bio: "Coach exécutive spécialisée dans la transformation organisationnelle",
    verified: 1,
    status: "actif"
  },
  {
    id: 5,
    name: "Dr. Julien Bernard",
    speciality: "Médecin du travail",
    location: "Toulouse, France",
    phone: "+33561234567",
    email: "julien.bernard@example.com",
    experience_years: 15,
    rating: "4.9",
    certifications: "Médecin du travail, Ergonome",
    availability: "Disponible",
    bio: "Spécialiste en médecine préventive et ergonomie au travail",
    verified: 1,
    status: "actif"
  },
  {
    id: 6,
    name: "Mme. Isabelle Moreau",
    speciality: "Sophrologue",
    location: "Nice, France",
    phone: "+33493345678",
    email: "isabelle.moreau@example.com",
    experience_years: 7,
    rating: "4.6",
    certifications: "Sophrologue certifiée RNCP",
    availability: "Disponible",
    bio: "Experte en gestion du stress et relaxation",
    verified: 1,
    status: "actif"
  },
  {
    id: 7,
    name: "Dr. Thomas Leroy",
    speciality: "Psychologue clinicien",
    location: "Bordeaux, France",
    phone: "+33556456789",
    email: "thomas.leroy@example.com",
    experience_years: 11,
    rating: "4.8",
    certifications: "Psychologue clinicien, TCC",
    availability: "Disponible",
    bio: "Spécialisé dans la prévention du burn-out",
    verified: 1,
    status: "actif"
  },
  {
    id: 8,
    name: "Mme. Caroline Petit",
    speciality: "Coach bien-être",
    location: "Strasbourg, France",
    phone: "+33388567890",
    email: "caroline.petit@example.com",
    experience_years: 9,
    rating: "4.7",
    certifications: "Coach certifiée ICF, Mindfulness",
    availability: "Disponible",
    bio: "Coach équilibre vie pro-vie privée",
    verified: 1,
    status: "actif"
  },
  {
    id: 9,
    name: "Dr. Alexandre Roux",
    speciality: "Ostéopathe",
    location: "Lille, France",
    phone: "+33320678901",
    email: "alexandre.roux@example.com",
    experience_years: 13,
    rating: "4.9",
    certifications: "Ostéopathe DO, Spécialiste TMS",
    availability: "Disponible",
    bio: "Expert prévention troubles musculo-squelettiques",
    verified: 1,
    status: "actif"
  },
  {
    id: 10,
    name: "Mme. Sandrine Blanc",
    speciality: "Nutritionniste",
    location: "Montpellier, France",
    phone: "+33467789012",
    email: "sandrine.blanc@example.com",
    experience_years: 6,
    rating: "4.5",
    certifications: "Diététicienne-nutritionniste",
    availability: "Disponible",
    bio: "Nutrition pour vitalité au travail",
    verified: 1,
    status: "actif"
  },
  {
    id: 11,
    name: "Dr. Philippe Martin",
    speciality: "Psychiatre",
    location: "Rennes, France",
    phone: "+33299890123",
    email: "philippe.martin@example.com",
    experience_years: 18,
    rating: "4.8",
    certifications: "Psychiatre, Addictologie",
    availability: "Disponible",
    bio: "Spécialiste risques psychosociaux",
    verified: 1,
    status: "actif"
  },
  {
    id: 12,
    name: "Mme. Émilie Dubois",
    speciality: "Coach sportif entreprise",
    location: "Clermont-Ferrand, France",
    phone: "+33473901234",
    email: "emilie.dubois@example.com",
    experience_years: 5,
    rating: "4.6",
    certifications: "BPJEPS, Coach wellness",
    availability: "Disponible",
    bio: "Animation activités physiques en entreprise",
    verified: 1,
    status: "actif"
  },
  {
    id: 13,
    name: "Dr. Michel Garnier",
    speciality: "Ergonome",
    location: "Nancy, France",
    phone: "+33383012345",
    email: "michel.garnier@example.com",
    experience_years: 14,
    rating: "4.7",
    certifications: "Ergonome certifié CNAM",
    availability: "Disponible",
    bio: "Amélioration conditions de travail",
    verified: 1,
    status: "actif"
  },
  {
    id: 14,
    name: "Mme. Laura Durand",
    speciality: "Art-thérapeute",
    location: "Dijon, France",
    phone: "+33380123456",
    email: "laura.durand@example.com",
    experience_years: 8,
    rating: "4.4",
    certifications: "Art-thérapeute certifiée",
    availability: "Disponible",
    bio: "Art et créativité pour le bien-être",
    verified: 1,
    status: "actif"
  }
];

const PractitionersDashboard = () => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('Tous les niveaux');
  const [activeTab, setActiveTab] = useState('practitioners');
  
  // États pour le modal d'ajout de praticien
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    location: '',
    experience_years: '',
    certifications: '',
    bio: '',
    availability: 'Disponible'
  });

  // Récupération des praticiens depuis votre base MySQL
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const response = await fetch('http://localhost:8002/practitioners.php');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des praticiens');
        }
        const data = await response.json();
        setPractitioners(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur praticiens:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioners();
  }, []);

  // Récupération des rendez-vous depuis votre base MySQL
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('http://localhost:8002/appointments.php');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des rendez-vous');
        }
        const data = await response.json();
        setAppointments(data);
        setAppointmentsError(null);
      } catch (err) {
        setAppointmentsError(err instanceof Error ? err.message : 'Erreur inconnue');
        console.error('Erreur rendez-vous:', err);
      } finally {
        setAppointmentsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredPractitioners = practitioners.filter(practitioner =>
    (practitioner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     practitioner.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (practitioner.location && practitioner.location.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (levelFilter === 'Tous les niveaux' || practitioner.specialty === levelFilter)
  );

  // Calcul des statistiques avec vos vraies données
  const totalPractitioners = practitioners.length;
  const pendingValidation = 0; // Tous vos praticiens sont validés
  const totalConsultations = practitioners.length * 30; // Estimation
  const averageRating = 4.7; // Estimation pour vos praticiens

  // Fonctions utilitaires pour les rendez-vous
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
    switch(type) {
      case 'consultation': return 'bg-blue-100 text-blue-800';
      case 'suivi': return 'bg-green-100 text-green-800';
      case 'urgence': return 'bg-red-100 text-red-800';
      case 'groupe': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Actions des boutons
  const handleAddPractitioner = () => {
    setIsAddModalOpen(true);
  };

  // Fonctions pour le formulaire
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      location: '',
      experience_years: '',
      certifications: '',
      bio: '',
      availability: 'Disponible'
    });
  };

  const handleSubmitPractitioner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation basique
      if (!formData.name || !formData.email || !formData.specialty) {
        alert('Veuillez remplir les champs obligatoires : Nom, Email et Spécialité');
        return;
      }

      // Préparer les données pour l'API
      const practitionerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        specialty: formData.specialty,
        location: formData.location || null,
        experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
        certifications: formData.certifications || null,
        bio: formData.bio || null,
        availability: formData.availability,
        verified: 1
      };

      // Appel API réel
      const response = await fetch('http://localhost:8002/add_practitioner.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(practitionerData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de l\'ajout du praticien');
      }

      const newPractitioner = result.data;
      
      // Ajouter à la liste locale
      setPractitioners(prev => [newPractitioner, ...prev]);
      
      alert('Praticien ajouté avec succès !');
      resetForm();
      setIsAddModalOpen(false);
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du praticien');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPractitioner = (practitioner: Practitioner) => {
    alert(`Éditer le praticien: ${practitioner.name}\nFonctionnalité à développer : formulaire d'édition`);
    // TODO: Ouvrir un modal d'édition avec les données du praticien
  };

  const handleDeletePractitioner = async (practitioner: Practitioner) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le praticien "${practitioner.name}" ?`)) {
      try {
        // TODO: Implémenter l'API de suppression
        alert(`Suppression de ${practitioner.name} - API à implémenter`);
        // const response = await fetch(`http://localhost:8001/practitioners.php?id=${practitioner.id}`, {
        //   method: 'DELETE'
        // });
        // if (response.ok) {
        //   // Recharger la liste des praticiens
        //   setPractitioners(prev => prev.filter(p => p.id !== practitioner.id));
        // }
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    alert(`Éditer le rendez-vous: ${appointment.patient_name} avec ${appointment.practitioner_name}\nFonctionnalité à développer`);
    // TODO: Ouvrir un modal d'édition de rendez-vous
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous de ${appointment.patient_name} ?`)) {
      try {
        alert(`Suppression du rendez-vous - API à implémenter`);
        // TODO: Implémenter l'API de suppression de rendez-vous
      } catch (error) {
        alert('Erreur lors de la suppression du rendez-vous');
      }
    }
  };

  const handleCreateAppointment = () => {
    alert('Créer un nouveau rendez-vous - Fonctionnalité à développer');
    // TODO: Ouvrir un modal de création de rendez-vous
  };

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des praticiens de votre base MySQL...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur de connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Vérifiez que le serveur API fonctionne sur le port 8001
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statistiques */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Praticiens</h1>
            <p className="text-sm text-gray-600">Gestion des praticiens de santé et bien-être</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un praticien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau praticien</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du praticien de santé et bien-être.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmitPractitioner} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Ex: Dr. Marie Dubois"
                      required
                    />
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="marie.dubois@example.com"
                      required
                    />
                  </div>
                  
                  {/* Téléphone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+33142345678"
                    />
                  </div>
                  
                  {/* Spécialité */}
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Spécialité *</Label>
                    <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Psychologue du travail">Psychologue du travail</SelectItem>
                        <SelectItem value="Psychologue clinicien">Psychologue clinicien</SelectItem>
                        <SelectItem value="Thérapeute holistique">Thérapeute holistique</SelectItem>
                        <SelectItem value="Coach en entreprise">Coach en entreprise</SelectItem>
                        <SelectItem value="Coach bien-être">Coach bien-être</SelectItem>
                        <SelectItem value="Médecin du travail">Médecin du travail</SelectItem>
                        <SelectItem value="Sophrologue">Sophrologue</SelectItem>
                        <SelectItem value="Ostéopathe">Ostéopathe</SelectItem>
                        <SelectItem value="Nutritionniste">Nutritionniste</SelectItem>
                        <SelectItem value="Psychiatre">Psychiatre</SelectItem>
                        <SelectItem value="Art-thérapeute">Art-thérapeute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Localisation */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Localisation</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Paris, France"
                    />
                  </div>
                  
                  {/* Années d'expérience */}
                  <div className="space-y-2">
                    <Label htmlFor="experience">Années d'expérience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years}
                      onChange={(e) => handleInputChange('experience_years', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  
                  {/* Disponibilité */}
                  <div className="space-y-2">
                    <Label htmlFor="availability">Disponibilité</Label>
                    <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="Occupé">Occupé</SelectItem>
                        <SelectItem value="En congé">En congé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Certifications */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="certifications">Certifications</Label>
                    <Input
                      id="certifications"
                      value={formData.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      placeholder="Psychologue clinicien, Coach certifié"
                    />
                  </div>
                </div>
                
                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Spécialiste en bien-être au travail avec plus de 10 ans d'expérience..."
                    rows={3}
                  />
                </div>
                
                {/* Boutons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Ajout en cours...' : 'Ajouter le praticien'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalPractitioners}</div>
                  <div className="text-sm text-gray-600">Total praticiens</div>
                  <div className="text-xs text-green-600">14 actifs</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{pendingValidation}</div>
                  <div className="text-sm text-gray-600">En attente de validation</div>
                  <div className="text-xs text-gray-500">À valider</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{totalConsultations}</div>
                  <div className="text-sm text-gray-600">Consultations totales</div>
                  <div className="text-xs text-green-600">+15% ce mois</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{averageRating}</div>
                  <div className="text-sm text-gray-600">Note moyenne</div>
                  <div className="text-xs text-green-600">+0.2 vs mois dernier</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onglets Praticiens / Rendez-vous */}
      <div className="px-6 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="practitioners">
              <Users className="w-4 h-4 mr-2" />
              Praticiens ({practitioners.length})
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <Calendar className="w-4 h-4 mr-2" />
              Rendez-vous ({appointments.length})
            </TabsTrigger>
          </TabsList>

          {/* Onglet Praticiens */}
          <TabsContent value="practitioners" className="space-y-4">
            {/* Filtres et recherche pour praticiens */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Rechercher par nom ou spécialité..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous les niveaux">Tous les niveaux</SelectItem>
                <SelectItem value="Psychologue du travail">Psychologue du travail</SelectItem>
                <SelectItem value="Psychologue clinicien">Psychologue clinicien</SelectItem>
                <SelectItem value="Thérapeute holistique">Thérapeute holistique</SelectItem>
                <SelectItem value="Coach en entreprise">Coach en entreprise</SelectItem>
                <SelectItem value="Coach bien-être">Coach bien-être</SelectItem>
                <SelectItem value="Médecin du travail">Médecin du travail</SelectItem>
                <SelectItem value="Sophrologue">Sophrologue</SelectItem>
                <SelectItem value="Ostéopathe">Ostéopathe</SelectItem>
                <SelectItem value="Nutritionniste">Nutritionniste</SelectItem>
                <SelectItem value="Psychiatre">Psychiatre</SelectItem>
                <SelectItem value="Coach sportif entreprise">Coach sportif entreprise</SelectItem>
                <SelectItem value="Ergonome">Ergonome</SelectItem>
                <SelectItem value="Art-thérapeute">Art-thérapeute</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Filtrer
            </Button>
            <div className="text-sm text-gray-500">
              {filteredPractitioners.length} praticien{filteredPractitioners.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

            {/* Liste des praticiens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractitioners.map((practitioner) => (
            <Card key={practitioner.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {practitioner.name}
                      {practitioner.verified && (
                        <CheckCircle className="inline-block w-4 h-4 text-green-500 ml-2" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-blue-600 mb-1">
                      {practitioner.specialty}
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {averageRating}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{practitioner.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{practitioner.phone}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{practitioner.email}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{practitioner.experience_years} ans d'expérience</span>
                  </div>
                  
                  {practitioner.certifications && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {practitioner.certifications.split(',').map((cert, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cert.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {practitioner.bio && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                      {practitioner.bio}
                    </p>
                  )}
                  
                  <div className="pt-4 space-y-2">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          size="sm"
                          onClick={handleCreateAppointment}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Programmer
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPractitioner(practitioner)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeletePractitioner(practitioner)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <Badge 
                        variant={practitioner.availability === 'Disponible' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {practitioner.availability || 'Non disponible'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {filteredPractitioners.length === 0 && searchTerm && (
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
            )}
          </TabsContent>

          {/* Onglet Rendez-vous */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Rendez-vous</h2>
              <Button>
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
                    </CardContent>
                  </Card>
                ))}
                
                {appointments.length === 0 && (
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
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PractitionersDashboard;
