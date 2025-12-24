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
  AlertTriangle
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

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
    intensity: 'medium'
  });

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
    let results = defis;

    if (searchTerm) {
      results = results.filter(defi =>
        defi.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        defi.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === 'actif') {
      results = results.filter(defi => defi.is_active || defi.status === 'actif');
    } else if (filterStatus === 'inactif') {
      results = results.filter(defi => !defi.is_active || defi.status === 'archivé');
    }

    setFilteredDefis(results);
  }, [searchTerm, filterStatus, defis]);

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
        intensity: challenge.intensity || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Émotion',
        challenge_type: 'day',
        points: 10,
        duration: '',
        intensity: 'medium'
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
        intensity: formData.intensity
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
          </TabsList>

          {/* TAB: DÉFIS */}
          <TabsContent value="defis" className="space-y-4">
            <Card className="p-4 bg-white">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un défi..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous</SelectItem>
                      <SelectItem value="actif">Actifs</SelectItem>
                      <SelectItem value="inactif">Archivés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
                  onClick={() => openDialog('create')}
                  disabled={loading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau défi
                </Button>
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
                <Card key={defi.id} className="p-4 bg-white hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{defi.title}</h3>
                        {getStatusBadge(defi)}
                        <Badge variant="outline">{defi.category}</Badge>
                        <Badge variant="secondary">
                          {getChallengeTypeLabel(defi.challenge_type || defi.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{defi.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                        <span>⭐ {defi.points || 0} points</span>
                        <span>👥 {defi.participants || 0} participants</span>
                        {defi.duration && <span>⏱️ {defi.duration}</span>}
                        {defi.intensity && <span>⚡ {defi.intensity}</span>}
                        <span>📅 {defi.created_at || 'Date inconnue'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="text-blue-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => openDialog('edit', defi)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600"
                        onClick={() => openDialog('delete', defi)}
                        disabled={loading}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredDefis.length === 0 && !loading && (
                <Card className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">Aucun défi trouvé</h3>
                  <p className="text-gray-500 mt-2">
                    {searchTerm || filterStatus !== 'tous'
                      ? 'Aucun résultat correspondant à vos critères'
                      : 'Votre base de données est vide. Créez votre premier défi !'
                    }
                  </p>
                  <Button
                    className="mt-4 bg-purple-600 hover:bg-purple-700"
                    onClick={() => openDialog('create')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un défi
                  </Button>
                </Card>
              )}
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' && 'Créer un nouveau défi'}
                {dialogMode === 'edit' && 'Modifier le défi'}
                {dialogMode === 'delete' && 'Archiver le défi'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'delete'
                  ? 'Le défi archivé ne sera plus visible par les utilisateurs.'
                  : 'Remplissez les informations du défi.'
                }
              </DialogDescription>
            </DialogHeader>

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
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Méditation matinale"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Décrivez le défi..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="challenge_type">Type</Label>
                    <Select
                      value={formData.challenge_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, challenge_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Quotidien</SelectItem>
                        <SelectItem value="week">Hebdomadaire</SelectItem>
                        <SelectItem value="month">Mensuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Émotion">Émotion</SelectItem>
                        <SelectItem value="Mouvement">Mouvement</SelectItem>
                        <SelectItem value="Énergie">Énergie</SelectItem>
                        <SelectItem value="Focus">Focus</SelectItem>
                        <SelectItem value="Santé">Santé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      name="points"
                      type="number"
                      value={formData.points}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Durée</Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Ex: 5 min"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="intensity">Intensité</Label>
                  <Select
                    value={formData.intensity}
                    onValueChange={(value) =>
                      setFormData({ ...formData, intensity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Archivage du défi</p>
                    <p className="text-sm text-orange-600 mt-1">
                      Êtes-vous sûr de vouloir archiver le défi "{selectedChallenge?.title}" ?
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={
                  dialogMode === 'delete'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    {dialogMode === 'create' && 'Créer'}
                    {dialogMode === 'edit' && 'Sauvegarder'}
                    {dialogMode === 'delete' && 'Archiver'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default AdminContentPanel;