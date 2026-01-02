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
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  specialty: string;
  certifications: string;
  experience_years: string;
  rating: string;
  availability: string;
  is_verified: number,
  bio: string;
  status: null;
  suspended_at: string;
  suspension_reason: string;

  // new infos
  country: string;
  city: string;
  consultation_mode: string;
  address: string;
  min_price: number;
  max_price: number;
  website: string;
  linkedin: string;
  rpps_number: number;
  siret_number: number;
  payment_methods: string;
  languages: string;
  certif_iprp_path: string;

  // Nouvelles colonnes de la base
  certif_iprp_verified: number;
  master_psy_travail_path: string;
  master_psy_travail_verified: number;
  accepts_new_patients: number;
  emergency_consultations: number;
  location: string;
  postal_code: string;
  specializations: string;

  created_at: string;
  updated_at: string;
}
interface NewPractitioner {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  specialty: string;
  experience_years: string;
  rating: string;
  certifications: string;
  availability: string;
  bio: string;
}

interface Appointment {
  id: number;
  practitioner_name: string;
  mode: string;
  status: string;
  scheduled_at: string;
  duration: number;
  type: string;
  notes: string | null;
  client_name: string;
  client_email: string;

  practitioner_email:string;
  practitioner_speciality: string;
  practitioner_phone: string;
  practitioner_country: string;
  practitioner_city: string;
  practitioner_availability: string;
  practitioner_certifications: string;
  practitioner_experience: string;
  practitioner_rating: number;
}

interface AgendaAppointment{
  id: number;
  mode: string;
  status: string;
  scheduled_at: string;
  duration: number;
  type: string;
  notes: string | null;
  client_name: string;
  client_email?: string;
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
  const [detailsPractitioner, setDetailsPractitioner] = useState<Practitioner | null>(null);
  
  // États pour les rendez-vous
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  //Suspension
  const [suspensionPractitioner, setSuspensionPractitioner] = useState<Practitioner | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isSuspensionOpen, setIsSuspensionOpen] = useState(false);

  //Agenda rendez-vous
  const [agendaPractitioner, setAgendaPractitioner] = useState<Practitioner | null>(null);
  const [agendaAppointments, setAgendaAppointments] = useState<AgendaAppointment[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);

  const [newPractitioner, setNewPractitioner] = useState<NewPractitioner>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    specialty: '',
    experience_years: '',
    rating: '',
    certifications: '',
    availability: '',
    bio: ''
  });

  // États pour les filtres des rendez-vous
const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
const [appointmentModeFilter, setAppointmentModeFilter] = useState('all');
const [appointmentPeriodFilter, setAppointmentPeriodFilter] = useState('all');
const [appointmentDurationFilter, setAppointmentDurationFilter] = useState('all');
const [customStartDate, setCustomStartDate] = useState('');
const [customEndDate, setCustomEndDate] = useState('');
// Fonction pour réinitialiser tous les filtres des rendez-vous
const resetAppointmentFilters = () => {
  setAppointmentSearchTerm('');
  setAppointmentStatusFilter('all');
  setAppointmentModeFilter('all');
  setAppointmentPeriodFilter('all');
  setAppointmentDurationFilter('all');
  setCustomStartDate('');
  setCustomEndDate('');
};

  // Fonction pour supprimer un praticien
  const handleDeletePractitioner = async (practitionerId: number, practitionerName: string) => {
    const confirmDelete = window.confirm(`Êtes-vous sûr de vouloir supprimer ${practitionerName} ?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/practitioners/${practitionerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`${practitionerName} a été supprimé avec succès !`);
        // Recharger la liste des praticiens
        const refreshResponse = await fetch('http://localhost:8000/api/practitioners');
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
      const response = await fetch(`http://localhost:8000/api/practitioners/${editingPractitioner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: editingPractitioner.first_name,
          last_name: editingPractitioner.last_name,
          email: editingPractitioner.email,
          phone: editingPractitioner.phone,
          specialty: editingPractitioner.specialty,
          bio: editingPractitioner.bio,
          availability: editingPractitioner.availability,
          certifications: editingPractitioner.certifications,
          experience_years: editingPractitioner.experience_years,
          rating: editingPractitioner.rating,
        })
      });

      const data = await response.json();
      
      if (data.success) {
        //alert('Praticien modifié avec succès !');
        setIsEditDialogOpen(false);
        setEditingPractitioner(null);
        
        // Recharger la liste
        const refreshResponse = await fetch('http://localhost:8000/api/practitioners');
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
        const response = await fetch('http://localhost:8000/api/practitioners');
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
        const response = await fetch('http://localhost:8000/api/appointments');
        
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
      const response = await fetch('http://localhost:8000/api/practitioners', {
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
        //alert('Praticien ajouté avec succès!');
        setNewPractitioner({
          first_name: '',
          last_name: '',
          phone: '',
          email: '',
          specialty:'',
          experience_years: '',
          rating: '',
          certifications: '',
          availability: '',
          bio: ''
        });
        setIsDialogOpen(false);
        
        // Recharger la liste
        const refreshResponse = await fetch('http://localhost:8000/api/practitioners');
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


  // handle SuspendrePractitioner
  const handleSuspendrePractitioner = async () => {
    if (!suspensionPractitioner) return;
  
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/practitioners/${suspensionPractitioner.id}/suspendre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspensionReason })
      });
  
      const data = await response.json();
  
      if (data.success) {
        //alert('Praticien suspendu avec succès !');
        setIsSuspensionOpen(false);
        setSuspensionPractitioner(null);
        setSuspensionReason('');
  
        // reload practitioners
        const refreshResponse = await fetch('http://localhost:8000/api/practitioners');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) setPractitioners(refreshData.data);
      } else {
        alert(`Erreur : ${data.error || data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Erreur de connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  // handle Reactivate practitionner
  const handleReactivatePractitioner = async (practitioner: Practitioner) => {
    if (!practitioner) return;
  
    try {
      setIsSubmitting(true);
  
      const response = await fetch(`http://localhost:8000/api/practitioners/${practitioner.id}/reactivate`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (data.success) {
        //alert('Praticien réactivé avec succès !');
  
        // Mettre à jour la liste localement
        setPractitioners(prev =>
          prev.map(p => (p.id === practitioner.id ? data.data : p))
        );
      } else {
        alert(`Erreur : ${data.error || data.message || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la réactivation:', error);
      alert('Erreur de connexion lors de la réactivation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour vérifier un praticien
const handleVerifyPractitioner = async (practitioner: Practitioner) => {
  try {
    setIsSubmitting(true);
    const response = await fetch(`http://localhost:8000/api/practitioners/${practitioner.id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.success) {
      //alert('Praticien vérifié avec succès !');
      // Mettre à jour le praticien dans la liste
      setPractitioners(prev => prev.map(p => p.id === practitioner.id ? data.data : p));
    } else {
      alert(`Erreur lors de la vérification : ${data.error || data.message || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    alert('Erreur de connexion lors de la vérification');
  } finally {
    setIsSubmitting(false);
  }
};
  
// Fonction pour ouvrir agenda
const openAgenda = async (practitioner: Practitioner) => {
  setAgendaPractitioner(practitioner);
  setAgendaLoading(true);

  try {
    const res = await fetch(
      `http://localhost:8000/api/practitioners/${practitioner.id}/appointments`
    );
    const data = await res.json();

    console.log('Agenda response:', data.data);

    if (data.success) {
      setAgendaAppointments(data.data);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setAgendaLoading(false);
  }
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);

  return `${date.getDate().toString().padStart(2, '0')}/${
    (date.getMonth() + 1).toString().padStart(2, '0')
  }/${date.getFullYear()} à ${
    date.getHours().toString().padStart(2, '0')
  }:${date.getMinutes().toString().padStart(2, '0')}`;
};

const getStatusBadge = (status: string): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } => {
  switch (status) {
    case 'confirme':
    case 'confirmed':
      return { label: 'Confirmé', variant: 'default' };

    case 'annule':
    case 'cancelled':
      return { label: 'Annulé', variant: 'destructive' };

    default:
      return { label: 'En attente', variant: 'secondary' };
  }
};



  const filteredPractitioners = practitioners.filter(practitioner => {
    const fullName = `${practitioner.first_name || ''} ${practitioner.last_name || ''}`.trim() || practitioner.first_name || '';
    // Gestion des deux variantes : specialty et speciality
    const speciality = practitioner.specialty || practitioner.specialty || '';
    const email = practitioner.email || '';
    const certifications = practitioner.certifications || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certifications.toLowerCase().includes(searchTerm.toLowerCase());
                         
    // Gestion des deux variantes pour le filtre de spécialité
    const practitionerSpecialty = practitioner.specialty || practitioner.specialty || '';
    const matchesSpecialty = selectedSpecialty === 'all' || practitionerSpecialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const uniqueSpecialties = [...new Set(practitioners.map(p => p.specialty || p.specialty || 'Non spécifié').filter(s => s))];

  // Filtrage des rendez-vous
const filteredAppointments = appointments.filter(appointment => {
  // Filtre par recherche
  const matchesSearch = appointmentSearchTerm === '' || 
    (appointment.practitioner_name && appointment.practitioner_name.toLowerCase().includes(appointmentSearchTerm.toLowerCase())) ||
    (appointment.client_name && appointment.client_name.toLowerCase().includes(appointmentSearchTerm.toLowerCase())) ||
    (appointment.practitioner_email && appointment.practitioner_email.toLowerCase().includes(appointmentSearchTerm.toLowerCase())) ||
    (appointment.client_email && appointment.client_email.toLowerCase().includes(appointmentSearchTerm.toLowerCase()));

  // Filtre par statut
  const matchesStatus = appointmentStatusFilter === 'all' || appointment.status === appointmentStatusFilter;

  // Filtre par mode
  const matchesMode = appointmentModeFilter === 'all' || 
    (appointmentModeFilter === 'teleconsultation' && appointment.mode === 'teleconsultation') ||
    (appointmentModeFilter === 'presentiel' && appointment.mode === 'presentiel');

  // Filtre par période
  let matchesPeriod = true;
  if (appointmentPeriodFilter !== 'all') {
    const appointmentDate = new Date(appointment.scheduled_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentPeriodFilter === 'today') {
      const appointmentDay = new Date(appointmentDate);
      appointmentDay.setHours(0, 0, 0, 0);
      matchesPeriod = appointmentDay.getTime() === today.getTime();
    } 
    else if (appointmentPeriodFilter === 'this_week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi de cette semaine
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche de cette semaine
      matchesPeriod = appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
    }
    else if (appointmentPeriodFilter === 'this_month') {
      matchesPeriod = appointmentDate.getMonth() === today.getMonth() && 
                     appointmentDate.getFullYear() === today.getFullYear();
    }
    else if (appointmentPeriodFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      matchesPeriod = appointmentDate >= start && appointmentDate <= end;
    }
  }

  return matchesSearch && matchesStatus && matchesMode && matchesPeriod;
});

// Fonction pour vérifier le certificat IPRP
const handleVerifyCertifIprp = async (practitioner: Practitioner) => {
  if (!practitioner) return;
  
  try {
    setIsSubmitting(true);
    const response = await fetch(`http://localhost:8000/api/practitioners/${practitioner.id}/verify-certif-iprp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.success) {
      // Mettre à jour le praticien dans la liste
      setPractitioners(prev => prev.map(p => p.id === practitioner.id ? data.data : p));
      // Mettre à jour le praticien dans detailsPractitioner s'il est ouvert
      if (detailsPractitioner?.id === practitioner.id) {
        setDetailsPractitioner(data.data);
      }
    } else {
      alert(`Erreur lors de la vérification : ${data.error || data.message || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    alert('Erreur de connexion lors de la vérification');
  } finally {
    setIsSubmitting(false);
  }
};

// Fonction pour vérifier le master psy travail
const handleVerifyMasterPsy = async (practitioner: Practitioner) => {
  if (!practitioner) return;
  
  try {
    setIsSubmitting(true);
    const response = await fetch(`http://localhost:8000/api/practitioners/${practitioner.id}/verify-master-psy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (data.success) {
      // Mettre à jour le praticien dans la liste
      setPractitioners(prev => prev.map(p => p.id === practitioner.id ? data.data : p));
      // Mettre à jour le praticien dans detailsPractitioner s'il est ouvert
      if (detailsPractitioner?.id === practitioner.id) {
        setDetailsPractitioner(data.data);
      }
    } else {
      alert(`Erreur lors de la vérification : ${data.error || data.message || 'Erreur inconnue'}`);
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    alert('Erreur de connexion lors de la vérification');
  } finally {
    setIsSubmitting(false);
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

          {/* Praticiens ALL*/}
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

                    {/*Speciality: 'specialty' */}
                    <div>
                      <Label htmlFor="Specialité">Specialité *</Label>
                      <Input
                        id="specialty"
                        type="specialty"
                        value={newPractitioner.specialty}
                        onChange={(e) => setNewPractitioner(prev => ({ ...prev, specialty: e.target.value }))}
                        placeholder="Santé"
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
                              {/* Nouveau badge pour le statut */}
                              <Badge 
                                variant={practitioner.status === 'suspended' ? 'destructive' : 'default'}
                              >
                                {practitioner.status === 'suspended' ? 'Suspendu' : 'Actif'}
                              </Badge>

                              {practitioner.is_verified ? (
                                <Badge variant="default">✔ Vérifié</Badge>
                              ) : (
                                <Badge variant="outline">Non vérifié</Badge>
                              )}

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

                              {practitioner.status === 'suspended' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReactivatePractitioner(practitioner)}
                                className="text-green-600 hover:text-green-700"
                                title="Réactiver ce praticien"
                              >
                                Activer
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={()=>{
                                  setSuspensionPractitioner(practitioner); // store the practitioner to suspend
                                  setIsSuspensionOpen(true); 
                                } 
                                }
                                className="text-red-600 hover:text-red-700"
                                title="Suspendre ce praticien"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </Button>
                            )}

                            {/* Vérifier si non vérifié */}
                            {!practitioner.is_verified && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleVerifyPractitioner(practitioner)}
                              >
                                Vérifier
                              </Button>
                            )}

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
                            
                            {practitioner.certifications && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <span className="text-green-600">🏆</span>
                                <span className="truncate" title={practitioner.certifications}>
                                  {practitioner.certifications}
                                </span>
                              </div>
                            )}
                            
                          
                          </div>

                          <div className="flex justify-between gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDetailsPractitioner(practitioner)}
                              className="flex items-center gap-1 flex-1"
                            >
                              <span>📋</span>
                              Détails
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAgenda(practitioner)}
                              className="flex items-center gap-1 flex-1"
                            >
                              <Calendar className="w-4 h-4" />
                              Agenda
                            </Button>
                          </div>
    
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>


          {/* Rendez_vous ALL*/}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Rendez-vous</h2>
              <div className="text-sm text-gray-600">
                {filteredAppointments.length} rendez-vous sur {appointments.length} total
              </div>
            </div>

            {/* Barre de filtres */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Recherche */}
                <Input
                  placeholder="Rechercher par nom..."
                  value={appointmentSearchTerm}
                  onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                  className="w-48"
                />
                
                {/* Filtre par statut */}
                <Select value={appointmentStatusFilter} onValueChange={setAppointmentStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtre par mode */}
                <Select value={appointmentModeFilter} onValueChange={setAppointmentModeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modes</SelectItem>
                    <SelectItem value="teleconsultation">Téléconsultation</SelectItem>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtre par période */}
                <Select value={appointmentPeriodFilter} onValueChange={setAppointmentPeriodFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes périodes</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="this_week">Cette semaine</SelectItem>
                    <SelectItem value="this_month">Ce mois</SelectItem>
                    <SelectItem value="custom">Personnalisée</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Champs de dates pour période personnalisée */}
                {appointmentPeriodFilter === 'custom' && (
                  <>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-40"
                    />
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-40"
                    />
                  </>
                )}
                
                {/* Bouton de réinitialisation */}
                <Button 
                  variant="outline" 
                  onClick={resetAppointmentFilters}
                  className="ml-auto"
                >
                  Réinitialiser
                </Button>
              </div>
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
              <div className="p-6">
                {appointmentsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Chargement des rendez-vous...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous trouvé</h3>
                    <p className="text-gray-600">
                      {appointments.length === 0 ? 
                        "Aucun rendez-vous programmé pour le moment" : 
                        "Aucun rendez-vous ne correspond à vos critères de recherche"
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredAppointments.map((appointment) => {
                      const statusBadge = getStatusBadge(appointment.status);
                      
                      return (
                        <Card key={appointment.id} className="hover:shadow-md transition-shadow duration-200">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold mb-2">
                                  RDV #{appointment.id} - {appointment.practitioner_name || 'Praticien non assigné'}
                                </CardTitle>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant={statusBadge.variant}>
                                    {statusBadge.label}
                                  </Badge>
                                  <Badge variant="outline">
                                    {appointment.mode === 'teleconsultation' ? '📞 Téleconsultation' : '🏢 Présentiel'}
                                  </Badge>
                                  {appointment.type && (
                                    <Badge variant="secondary">
                                      Type: {appointment.type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Informations principales */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Informations du praticien */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    Praticien
                                  </h4>
                                  <div className="space-y-2 pl-4">
                                    {appointment.practitioner_name && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Nom:</span>
                                        <span className="text-gray-700">{appointment.practitioner_name}</span>
                                      </div>
                                    )}
                                    {appointment.practitioner_email && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-3 h-3" />
                                        <span>{appointment.practitioner_email}</span>
                                      </div>
                                    )}
                                    {appointment.practitioner_phone && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-3 h-3" />
                                        <span>{appointment.practitioner_phone}</span>
                                      </div>
                                    )}
                                    {appointment.practitioner_speciality && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Spécialité:</span>
                                        <Badge variant="outline" className="text-xs">
                                          {appointment.practitioner_speciality}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Informations du client */}
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    Client
                                  </h4>
                                  <div className="space-y-2 pl-4">
                                    {appointment.client_name && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium">Nom:</span>
                                        <span className="text-gray-700">{appointment.client_name}</span>
                                      </div>
                                    )}
                                    {appointment.client_email && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-3 h-3" />
                                        <span>{appointment.client_email}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Détails du rendez-vous */}
                              <div className="border-t pt-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-semibold">Date et heure:</span>
                                  <span>{formatDateTime(appointment.scheduled_at)}</span>
                                  {appointment.duration && (
                                    <span className="ml-4">
                                      <span className="font-semibold">Durée:</span> {appointment.duration} min
                                    </span>
                                  )}
                                </div>

                                {/* Notes */}
                                {appointment.notes && (
                                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-gray-700">
                                      <strong className="text-blue-700">Notes:</strong> {appointment.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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

      {/* Dialog de suspension */}
      <Dialog open={isSuspensionOpen} onOpenChange={setIsSuspensionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspendre le praticien</DialogTitle>
            <DialogDescription>
              Renseignez la raison de la suspension pour {suspensionPractitioner?.first_name} {suspensionPractitioner?.last_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Label htmlFor="suspension-reason">Raison *</Label>
            <Input
              id="suspension-reason"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Ex: Non-respect des règles internes"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsSuspensionOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSuspendrePractitioner}>
              Suspendre
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Dialog des rendez-vous par praticien */}
      <Dialog open={!!agendaPractitioner} onOpenChange={() => setAgendaPractitioner(null)}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Agenda de {agendaPractitioner?.first_name} {agendaPractitioner?.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {agendaLoading && (
            <p className="text-center text-muted-foreground">
              Chargement des rendez-vous...
            </p>
          )}

          {!agendaLoading && agendaAppointments.length === 0 && (
            <p className="text-center text-muted-foreground">
              Aucun rendez-vous programmé
            </p>
          )}

          {!agendaLoading && agendaAppointments.map((appointment) => {
            const badge = getStatusBadge(appointment.status);

            return (
              <Card key={appointment.id} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-semibold">
                      📅 {formatDateTime(appointment.scheduled_at)}
                    </CardTitle>
                    <Badge variant={badge.variant}>
                      {badge.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm">
                  {/* Client Information */}
                  <div className="border rounded-md p-3 bg-blue-50">
                    <p className="font-medium mb-1">Patient</p>
                    {appointment.client_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Nom:</span>
                        <span className="text-gray-700">{appointment.client_name}</span>
                      </div>
                    )}
                    {appointment.client_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{appointment.client_email}</span>
                      </div>
                    )}
                  </div>

                  {/* Type & durée */}
                  <div className="flex gap-4 text-muted-foreground">
                    <span>🩺 Type : <strong>{appointment.type}</strong></span>
                    <span>⏱ Durée : <strong>{appointment.duration} min</strong></span>
                    <span>📍 Mode : <strong>{appointment.mode}</strong></span>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
      </Dialog>
      
      {/* Dialog des praticens details */}
      <Dialog open={!!detailsPractitioner} onOpenChange={() => setDetailsPractitioner(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              📋 Détails complet du praticien
            </DialogTitle>
            <DialogDescription>
              Informations détaillées de {detailsPractitioner?.first_name} {detailsPractitioner?.last_name}
            </DialogDescription>
          </DialogHeader>

          {detailsPractitioner && (
            <div className="space-y-8">
              {/* En-tête avec statut */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {detailsPractitioner.first_name} {detailsPractitioner.last_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={detailsPractitioner.status === 'suspended' ? 'destructive' : 'default'}>
                        {detailsPractitioner.status === 'suspended' ? '⛔ Suspendu' : '✅ Actif'}
                      </Badge>
                      {detailsPractitioner.is_verified ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          ✔ Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          ⚠ Non vérifié
                        </Badge>
                      )}
                      {detailsPractitioner.rating && (
                        <Badge variant="outline" className="bg-yellow-50">
                          ⭐ {detailsPractitioner.rating}/5
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille d'informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span>👤</span> Informations personnelles
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID</p>
                      <p className="font-mono text-sm">{detailsPractitioner.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nom complet</p>
                      <p className="font-medium">{detailsPractitioner.first_name} {detailsPractitioner.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {detailsPractitioner.email || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Téléphone</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {detailsPractitioner.phone || 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span>💼</span> Informations professionnelles
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Spécialité</p>
                      <Badge variant="outline" className="mt-1">
                        {detailsPractitioner.specialty || 'Non spécifié'}
                      </Badge>
                    </div>
                    {detailsPractitioner.experience_years && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Expérience</p>
                        <p className="font-medium">{detailsPractitioner.experience_years} ans</p>
                      </div>
                    )}
                    {detailsPractitioner.consultation_mode && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Mode de consultation</p>
                        <p>{detailsPractitioner.consultation_mode}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations de localisation */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Localisation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {detailsPractitioner.country && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pays</p>
                      <p>{detailsPractitioner.country}</p>
                    </div>
                  )}
                  {detailsPractitioner.city && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ville</p>
                      <p>{detailsPractitioner.city}</p>
                    </div>
                  )}
                  {detailsPractitioner.postal_code && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Code postal</p>
                      <p>{detailsPractitioner.postal_code}</p>
                    </div>
                  )}
                  {detailsPractitioner.location && (
                    <div className="md:col-span-3">
                      <p className="text-sm font-medium text-gray-500">Localisation</p>
                      <p>{detailsPractitioner.location}</p>
                    </div>
                  )}
                  {detailsPractitioner.address && (
                    <div className="md:col-span-3">
                      <p className="text-sm font-medium text-gray-500">Adresse complète</p>
                      <p>{detailsPractitioner.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations financières */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <span>💰</span> Informations financières
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {detailsPractitioner.min_price && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prix minimum</p>
                      <p className="font-medium">{detailsPractitioner.min_price} €</p>
                    </div>
                  )}
                  {detailsPractitioner.max_price && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prix maximum</p>
                      <p className="font-medium">{detailsPractitioner.max_price} €</p>
                    </div>
                  )}
                  {detailsPractitioner.payment_methods && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Modes de paiement</p>
                      <p>{detailsPractitioner.payment_methods}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations administratives */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <span>📄</span> Informations administratives
                </h4>
                
                {/* Numéros administratifs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailsPractitioner.rpps_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Numéro RPPS</p>
                      <p className="font-mono">{detailsPractitioner.rpps_number}</p>
                    </div>
                  )}
                  {detailsPractitioner.siret_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Numéro SIRET</p>
                      <p className="font-mono">{detailsPractitioner.siret_number}</p>
                    </div>
                  )}
                </div>

                {/* Section des certificats */}
                <div className="mt-6 space-y-4">
                  <h5 className="font-semibold text-md flex items-center gap-2">
                    <span>📋</span> Certificats et vérifications
                  </h5>
                  
                  {/* Certificat IPRP */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Certificat IPRP</span>
                        {detailsPractitioner.certif_iprp_verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✔ Vérifié
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            ⚠ Non vérifié
                          </Badge>
                        )}
                      </div>
                      {!detailsPractitioner.certif_iprp_verified && detailsPractitioner.certif_iprp_path && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyCertifIprp(detailsPractitioner)}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Vérifier
                        </Button>
                      )}
                    </div>
                    {detailsPractitioner.certif_iprp_path ? (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Fichier :</p>
                        <a 
                          href={`http://localhost:8000/${detailsPractitioner.certif_iprp_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {detailsPractitioner.certif_iprp_path}
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">Aucun fichier uploadé</p>
                    )}
                  </div>

                  {/* Master Psy Travail */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Master Psy Travail</span>
                        {detailsPractitioner.master_psy_travail_verified ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✔ Vérifié
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                            ⚠ Non vérifié
                          </Badge>
                        )}
                      </div>
                      {!detailsPractitioner.master_psy_travail_verified && detailsPractitioner.master_psy_travail_path && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyMasterPsy(detailsPractitioner)}
                          disabled={isSubmitting}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Vérifier
                        </Button>
                      )}
                    </div>
                    {detailsPractitioner.master_psy_travail_path ? (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Fichier :</p>
                        <a 
                          href={`http://localhost:8000/${detailsPractitioner.master_psy_travail_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {detailsPractitioner.master_psy_travail_path}
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-2">Aucun fichier uploadé</p>
                    )}
                  </div>
                </div>

                {/* Informations complémentaires */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Accepte de nouveaux patients</p>
                    <Badge variant={detailsPractitioner.accepts_new_patients ? "default" : "outline"}>
                      {detailsPractitioner.accepts_new_patients ? "✅ Oui" : "❌ Non"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Consultations d'urgence</p>
                    <Badge variant={detailsPractitioner.emergency_consultations ? "default" : "outline"}>
                      {detailsPractitioner.emergency_consultations ? "✅ Disponible" : "❌ Non disponible"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Disponibilité et langues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {detailsPractitioner.availability && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span>🕐</span> Disponibilité
                    </h4>
                    <p className="p-3 bg-blue-50 rounded-md">
                      {detailsPractitioner.availability}
                    </p>
                  </div>
                )}
                {detailsPractitioner.languages && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span>🌐</span> Langues parlées
                    </h4>
                    <p className="p-3 bg-green-50 rounded-md">
                      {detailsPractitioner.languages}
                    </p>
                  </div>
                )}
              </div>

              {/* Certifications */}
              {detailsPractitioner.certifications && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span>🏆</span> Certifications
                  </h4>
                  <p className="p-4 bg-gray-50 rounded-md border">
                    {detailsPractitioner.certifications}
                  </p>
                </div>
              )}

              {/* Spécialisations */}
              {detailsPractitioner.specializations && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span>🎯</span> Spécialisations
                  </h4>
                  <p className="p-4 bg-purple-50 rounded-md border">
                    {detailsPractitioner.specializations}
                  </p>
                </div>
              )}

              {/* Biographie */}
              {detailsPractitioner.bio && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <span>📝</span> Biographie
                  </h4>
                  <p className="p-4 bg-gray-50 rounded-md whitespace-pre-line border">
                    {detailsPractitioner.bio}
                  </p>
                </div>
              )}

              {/* Liens et informations complémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(detailsPractitioner.website || detailsPractitioner.linkedin) && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">Liens</h4>
                    <div className="space-y-2">
                      {detailsPractitioner.website && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Site web:</span>
                          <a 
                            href={detailsPractitioner.website.startsWith('http') ? detailsPractitioner.website : `https://${detailsPractitioner.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {detailsPractitioner.website}
                          </a>
                        </div>
                      )}
                      {detailsPractitioner.linkedin && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">LinkedIn:</span>
                          <a 
                            href={detailsPractitioner.linkedin.startsWith('http') ? detailsPractitioner.linkedin : `https://${detailsPractitioner.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {detailsPractitioner.linkedin}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations de suspension */}
                {detailsPractitioner.status === 'suspended' && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-red-600">⛔ Suspension</h4>
                    <div className="p-4 bg-red-50 rounded-md border border-red-200">
                      {detailsPractitioner.suspension_reason && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-700">Raison</p>
                          <p className="text-red-600">{detailsPractitioner.suspension_reason}</p>
                        </div>
                      )}
                      {detailsPractitioner.suspended_at && (
                        <div>
                          <p className="text-sm font-medium text-red-700">Date de suspension</p>
                          <p className="text-red-600">
                            {new Date(detailsPractitioner.suspended_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Informations système */}
              <div className="space-y-3 pt-6 border-t">
                <h4 className="font-semibold text-lg">📊 Informations système</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium">Date de création</p>
                    <p>
                      {new Date(detailsPractitioner.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Dernière mise à jour</p>
                    <p>
                      {new Date(detailsPractitioner.updated_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                 
                  
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-between pt-6 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openAgenda(detailsPractitioner)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Voir l'agenda
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleEditPractitioner(detailsPractitioner);
                      setDetailsPractitioner(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                  {!detailsPractitioner.is_verified && (
                    <Button
                      variant="outline"
                      onClick={() => handleVerifyPractitioner(detailsPractitioner)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      disabled={isSubmitting}
                    >
                      <span className="text-green-600">✓</span>
                      Vérifier le praticien
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetailsPractitioner(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
