import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Target,
  Package,
  FileText,
  Headphones,
  Plus,
  Edit,
  Archive,
  Eye,
  Search,
  Filter,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle,
  Users, 
  Star 
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

interface participantsParDefi {
  id: number; 
  name: string;
  email: string;
  score: number;
  rate: number;
}


const AdminContentPanel = () => {
  const [activeTab, setActiveTab] = useState('defis');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [defis, setDefis] = useState([]);
  const [filteredDefis, setFilteredDefis] = useState([]);
  const [archivedDefis, setArchivedDefis] = useState([]);
  const [filteredArchivedDefis, setFilteredArchivedDefis] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Émotion',
    challenge_type: 'day',
    points: 10,
    duration: '',
    intensity: 'medium',
    objective: '',
    pack_thematique: '',
    image_path: '',
    video_path: '',

  });

  const [filterCategory, setFilterCategory] = useState('toutes');
  const [filterSort, setFilterSort] = useState('recent'); // Pour la popularité/date
  const [participantsData, setParticipantsData] = useState<participantsParDefi[]>([]);
  const [isDialogParticipantOpen, setIsDialogParticipantOpen] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Fonction pour charger les défis
  const fetchChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching challenges from:', `${API_BASE_URL}/challenges`);

      const response = await fetch(`${API_BASE_URL}/challenges`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data);
        throw new Error('Les données reçues ne sont pas au format attendu');
      }

      setDefis(data);
      setFilteredDefis(data);

    } catch (err) {
      console.error('Error in fetchChallenges:', err);
      // @ts-ignore
      setError(`Impossible de charger les défis: ${err.message}`);
    } finally {
      setLoading(false);
    }

  };

  // Fonction pour charger les défis archivés
  const fetchArchivedChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/trashed`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setArchivedDefis(data);
      setFilteredArchivedDefis(data);
    } catch (err) {
      console.error('Error in fetchArchivedChallenges:', err);
      // @ts-ignore
      setError(`Impossible de charger les archives: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour restaurer un défi
  const handleRestore = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${id}/restore`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la restauration');
      }

      setSuccess('Défi restauré avec succès !');
      fetchChallenges();
      fetchArchivedChallenges();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    fetchChallenges();
    fetchArchivedChallenges();
  }, []);

  // Filtrer les défis
  useEffect(() => {
  let results = [...defis];

  // 1. Filtre par texte
  if (searchTerm) {
    results = results.filter(defi =>
      defi.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defi.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 2. Filtre par Statut
  if (filterStatus === 'actif') {
    results = results.filter(defi => defi.is_active === true || defi.is_active === 1 || defi.status === 'actif');
  } else if (filterStatus === 'inactif') {
    results = results.filter(defi => defi.is_active === false || defi.is_active === 0 || defi.status === 'archivé');
  }

  // 3. Filtre par Catégorie
  if (filterCategory !== 'toutes') {
    results = results.filter(defi => defi.category === filterCategory);
  }

  // 4. Tri (Important pour l'expérience utilisateur)
  results.sort((a, b) => {
    if (filterSort === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (filterSort === 'points') return (b.points || 0) - (a.points || 0);
    if (filterSort === 'popularite') return (b.participants_count || b.participants || 0) - (a.participants_count || a.participants || 0);
  });

  setFilteredDefis(results);
}, [searchTerm, filterStatus, filterCategory, filterSort, defis]);

  // Filtrer les défis archivés
  useEffect(() => {
    let results = archivedDefis;
    if (searchTerm) {
      results = results.filter(defi =>
        defi.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defi.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredArchivedDefis(results);
  }, [searchTerm, archivedDefis]);

  // Ouvrir le dialogue
  const openDialog = (mode, challenge = null) => {
    setDialogMode(mode);
    setSelectedChallenge(challenge);
    setError('');
    setSuccess('');

    if (challenge) {
      setFormData({
        title: challenge.title || '',
        description: challenge.description || '',
        category: challenge.category || 'Émotion',
        challenge_type: challenge.challenge_type || challenge.type || 'day',
        points: challenge.points || 10,
        duration: challenge.duration || '',
        intensity: challenge.intensity || 'medium',
        objective: challenge.objective || '',
        pack_thematique: challenge.pack_thematique || '',
        image_path: challenge.image_path || '',
        video_path: challenge.video_path || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Émotion',
        challenge_type: 'day',
        points: 10,
        duration: '',
        intensity: 'medium',
        objective: '',
        pack_thematique: '',
        image_path: '',
        video_path: ''
      });
    }
    setIsDialogOpen(true);
  };

  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let url = `${API_BASE_URL}/challenges`;
      let method = 'POST';

      if (dialogMode === 'edit' && selectedChallenge) {
        url = `${API_BASE_URL}/challenges/${selectedChallenge.id}`;
        method = 'PUT';
      } else if (dialogMode === 'delete' && selectedChallenge) {
        url = `${API_BASE_URL}/challenges/${selectedChallenge.id}`;
        method = 'DELETE';
      }

      const payload = dialogMode !== 'delete' ? {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        challenge_type: formData.challenge_type,
        points: Number(formData.points),
        duration: formData.duration,
        intensity: formData.intensity,
        objective: formData.objective,
        pack_thematique: formData.pack_thematique,
        image_path: formData.image_path,
        video_path: formData.video_path
      } : {};

      console.log('Sending request:', { url, method, payload });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: dialogMode !== 'delete' ? JSON.stringify(payload) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (dialogMode === 'create') {
        setSuccess('Défi créé avec succès !');
      } else if (dialogMode === 'edit') {
        setSuccess('Défi mis à jour avec succès !');
      } else if (dialogMode === 'delete') {
        setSuccess('Défi archivé avec succès !');
      }

      // Recharger les données
      setTimeout(() => {
        fetchChallenges();
        fetchArchivedChallenges();
        setIsDialogOpen(false);
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions d'aide
  const getStatusBadge = (challenge) => {
    const isActive = challenge.is_active !== undefined ? challenge.is_active : challenge.status === 'actif';

    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archivé</Badge>
    );
  };

  const getChallengeTypeLabel = (type) => {
    const typeValue = type || 'day';
    const labels = {
      day: 'Quotidien',
      week: 'Hebdomadaire',
      month: 'Mensuel'
    };
    return labels[typeValue] || typeValue;
  };

  const getParticipantsParDefi = async ($id_challenge) => {
  setLoadingParticipants(true); // Utiliser l'état spécifique
  setError('');
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${$id_challenge}/participants`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    setParticipantsData(data);
  } catch (err) {
    console.error('Error in handleParticipantsParDefi:', err);
    // @ts-ignore
    setError(`Impossible de charger les participants: ${err.message}`);
  } finally {
    setLoadingParticipants(false); // Arrêter le chargement
  }
};

// Fonction pour ouvrir le dialogue des participants
const openParticipantsDialog = async (challenge) => {
  setSelectedChallenge(challenge);
  setIsDialogParticipantOpen(true);
  await getParticipantsParDefi(challenge.id);
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Admin */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
              <p className="text-purple-100 mt-1">Gestion du catalogue de contenus bien-être</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchChallenges}
                className="bg-white/20 hover:bg-white/30"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Settings className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Défis</p>
                <p className="text-2xl font-bold text-purple-600">{defis.length}</p>
                <p className="text-xs text-gray-500">
                  {defis.filter(d => d.is_active || d.status === 'actif').length} actifs
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-dashed border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Archives</p>
                <p className="text-2xl font-bold text-gray-400">{archivedDefis.length}</p>
                <p className="text-xs text-gray-500">Défis supprimés</p>
              </div>
              <Archive className="w-8 h-8 text-gray-300" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white">
            <TabsTrigger value="defis" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Défis
            </TabsTrigger>
            <TabsTrigger value="archives" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archives
            </TabsTrigger>
            <TabsTrigger value="pack" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Pack Thématiques
            </TabsTrigger>
          </TabsList>

          {/* TAB: DÉFIS */}
          <TabsContent value="defis" className="space-y-4">
            <Card className="p-4 bg-white shadow-sm border-purple-100">
            <div className="flex flex-col space-y-4">
              {/* Ligne 1: Recherche et Bouton Nouveau */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par titre ou description..."
                    className="pl-10 border-purple-50 focus:border-purple-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto shadow-md"
                  onClick={() => openDialog('create')}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau défi
                </Button>
              </div>

              {/* Ligne 2: Les filtres spécifiques */}
              <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Filtrer par :</span>
                </div>
                
                {/* Filtre Statut */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="actif">Actifs uniquement</SelectItem>
                    <SelectItem value="inactif">Inactifs</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filtre Catégorie */}
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toutes">Toutes catégories</SelectItem>
                    <SelectItem value="Émotion">Émotion</SelectItem>
                    <SelectItem value="Mouvement">Mouvement</SelectItem>
                    <SelectItem value="Focus">Focus</SelectItem>
                    <SelectItem value="Santé">Santé</SelectItem>
                  </SelectContent>
                </Select>

                <div className="h-4 w-[1px] bg-gray-200 mx-1 hidden md:block" />

                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Trier par :</span>
                </div>

                {/* Tri Popularité / Date */}
                <Select value={filterSort} onValueChange={setFilterSort}>
                  <SelectTrigger className="w-[150px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="popularite">Plus populaires (👥)</SelectItem>
                    <SelectItem value="points">Plus de points (⭐)</SelectItem>
                    <SelectItem value="ancien">Plus anciens</SelectItem>
                  </SelectContent>
                </Select>

                {/* Bouton Reset rapide */}
                {(searchTerm || filterStatus !== 'tous' || filterCategory !== 'toutes') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs text-red-500 hover:text-red-600"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('tous');
                      setFilterCategory('toutes');
                      setFilterSort('recent');
                    }}
                  >
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </Card>

            {/* Messages d'erreur/succès */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && !isDialogOpen && (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            )}

            {/* Liste des défis */}
            <div className="grid gap-4">
            {filteredDefis.map((defi) => (
              <Card key={defi.id} className="p-4 bg-white hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    
                    {/* Ligne 1: Titre et Badges principaux */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-bold text-lg text-gray-800">{defi.title}</h3>
                      {getStatusBadge(defi)}
                      <Badge variant="outline" className="bg-purple-50">{defi.category}</Badge>
                      <Badge variant="secondary" className="font-normal">
                        {getChallengeTypeLabel(defi.challenge_type || defi.type)}
                      </Badge>
                    </div>

                    {/* Ligne 2: Description */}
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{defi.description}"
                    </p>

                    {/* NOUVEAU - Ligne 3: Objectif et Pack Thématique */}
                    {(defi.objective || defi.pack_thematique) && (
                      <div className="flex flex-wrap gap-4 py-2 border-y border-gray-50">
                        {defi.objective && (
                          <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            <Target className="w-3.5 h-3.5 mr-1.5" />
                            <span className="font-medium">Objectif:</span>&nbsp;{defi.objective}
                          </div>
                        )}
                        {defi.pack_thematique && (
                          <div className="flex items-center text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">
                            <Package className="w-3.5 h-3.5 mr-1.5" />
                            <span className="font-medium">Pack:</span>&nbsp;{defi.pack_thematique}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ligne 4: Stats et Médias */}
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 flex-wrap">
                      <span className="flex items-center">⭐ {defi.points || 0} pts</span>
                      <Button 
                        className="flex items-center gap-1 hover:bg-gray-100 transition-colors"
                        variant="outline"
                        size="sm"
                        onClick={() => openParticipantsDialog(defi)}
                        disabled={loading}
                      >
                        <span>👥</span>
                        <span className="font-semibold text-gray-700 ml-1">
                          {defi.participants_count || defi.participants || 0}
                        </span>
                        <span className="text-gray-600 ml-1">participants</span>
                      </Button>
                      {defi.duration && <span className="flex items-center">⏱️ {defi.duration}</span>}
                      
                      {/* Indicateurs de médias présents */}
                      <div className="flex gap-2 ml-auto md:ml-0">
                        {defi.image_path && (
                          <span className="flex items-center text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                            <FileText className="w-3 h-3 mr-1" /> Image
                          </span>
                        )}
                        {defi.video_path && (
                          <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            <Headphones className="w-3 h-3 mr-1" /> Vidéo
                          </span>
                        )}
                      </div>
                      
                      <span className="text-gray-400">Ajouté le {new Date(defi.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 hover:bg-blue-50 border-blue-200"
                      onClick={() => openDialog('edit', defi)}
                      disabled={loading}
                    >
                      <Edit className="w-4 h-4 mr-2 md:mr-0" />
                      <span className="md:hidden">Modifier</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-600 hover:bg-orange-50 border-orange-200"
                      onClick={() => openDialog('delete', defi)}
                      disabled={loading}
                    >
                      <Archive className="w-4 h-4 mr-2 md:mr-0" />
                      <span className="md:hidden">Archiver</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          </TabsContent>

          {/* TAB: ARCHIVES */}
          <TabsContent value="archives" className="space-y-4">
            <Card className="p-4 bg-white">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher dans les archives..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card>

            <div className="grid gap-4">
              {filteredArchivedDefis.map((defi) => (
                <Card key={defi.id} className="p-4 bg-white border-dashed opacity-75 grayscale hover:grayscale-0 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-gray-500">{defi.title}</h3>
                        <Badge variant="secondary">Archivé le {new Date(defi.deleted_at).toLocaleDateString()}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{defi.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => handleRestore(defi.id)}
                        disabled={loading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restaurer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredArchivedDefis.length === 0 && !loading && (
                <Card className="p-8 text-center bg-gray-50 border-dashed">
                  <Archive className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucun défi archivé</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogue CRUD */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh] overflow-hidden">
          
          {/* HEADER FIXE */}
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="text-xl font-bold">
              {dialogMode === 'create' && 'Créer un nouveau défi'}
              {dialogMode === 'edit' && 'Modifier le défi'}
              {dialogMode === 'delete' && 'Archiver le défi'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'delete'
                ? 'Le défi archivé ne sera plus visible par les utilisateurs.'
                : 'Remplissez les informations détaillées du défi ci-dessous.'}
            </DialogDescription>
          </DialogHeader>

          {/* ZONE DE CONTENU SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            
            {/* Alertes de Notifications */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTriangle className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            {dialogMode !== 'delete' ? (
              <div className="space-y-4">
                {/* Section: Informations de base */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Ex: Méditation matinale" required />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea id="description" name="description" className="min-h-[100px]" value={formData.description} onChange={handleInputChange} placeholder="Décrivez le défi..." required />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Section: Paramètres techniques */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={formData.challenge_type} onValueChange={(v) => setFormData({...formData, challenge_type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Quotidien</SelectItem>
                        <SelectItem value="week">Hebdomadaire</SelectItem>
                        <SelectItem value="month">Mensuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Catégorie</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Émotion">Émotion</SelectItem>
                        <SelectItem value="Mouvement">Mouvement</SelectItem>
                        <SelectItem value="Focus">Focus</SelectItem>
                        <SelectItem value="Santé">Santé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input id="points" name="points" type="number" value={formData.points} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="duration">Durée</Label>
                    <Input id="duration" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="Ex: 5 min" />
                  </div>
                </div>

                {/* Section: Médias et Objectifs */}
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="objective">Objectif du défi</Label>
                    <Input id="objective" name="objective" value={formData.objective} onChange={handleInputChange} placeholder="Ex: Réduire le stress" />
                  </div>
                  <div>
                    <Label htmlFor="pack_thematique">Pack Thématique</Label>
                    <Input id="pack_thematique" name="pack_thematique" value={formData.pack_thematique} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="image_path">URL de l'image</Label>
                      <Input id="image_path" name="image_path" value={formData.image_path} onChange={handleInputChange} placeholder="/images/example.jpg" />
                    </div>
                    <div>
                      <Label htmlFor="video_path">URL de la vidéo</Label>
                      <Input id="video_path" name="video_path" value={formData.video_path} onChange={handleInputChange} placeholder="/videos/example.mp4" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Mode ARCHIVER */
              <div className="py-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Confirmation d'archivage</p>
                    <p className="text-sm text-orange-600 mt-1">
                      Voulez-vous vraiment archiver <strong>{selectedChallenge?.title}</strong> ?
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER FIXE */}
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className={dialogMode === 'delete' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {dialogMode === 'create' ? 'Créer le défi' : dialogMode === 'edit' ? 'Sauvegarder' : 'Confirmer l\'archivage'}
            </Button>
          </div>
        </DialogContent>
        </Dialog>
        
        {/* Dialogue participant */}
        <Dialog open={isDialogParticipantOpen} onOpenChange={setIsDialogParticipantOpen}>
        <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[90vh] overflow-hidden">
          
          {/* HEADER FIXE */}
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="text-xl font-bold">
              Participants du défi "{selectedChallenge?.title}"
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({participantsData.length} participant{participantsData.length !== 1 ? 's' : ''})
              </span>
            </DialogTitle>
            <DialogDescription>
              Liste des utilisateurs ayant participé à ce défi.
            </DialogDescription>
          </DialogHeader>
          
          {/* ZONE DE CONTENU SCROLLABLE */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {loadingParticipants ? (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mr-3" />
                <p className="text-gray-600">Chargement des participants...</p>
              </div>
            ) : participantsData.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12 text-gray-500">
                <Users className="w-16 h-16 mb-4 text-gray-300" />
                <p className="text-lg">Aucun participant</p>
                <p className="text-sm">Personne n'a encore participé à ce défi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {participantsData.map((participant) => (
                  <Card key={participant.id} className="p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                        {participant.name ? participant.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{participant.name || 'Utilisateur inconnu'}</p>
                        <p className="text-sm text-gray-500">{participant.email || 'Email non disponible'}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>Score: {participant.score || 0} pts</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Star className="w-4 h-4 mr-1 text-blue-500" />
                            <span>Note: {participant.rate || 0}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* FOOTER FIXE */}
          <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogParticipantOpen(false)}
              disabled={loadingParticipants}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      </div>
    </div>
  );
};

export default AdminContentPanel;