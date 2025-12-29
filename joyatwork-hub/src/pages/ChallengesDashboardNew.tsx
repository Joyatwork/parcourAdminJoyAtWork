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
  Star,
  Upload,
  X,
  ZoomIn,
  Tags,
  FolderOpen,
  Info
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api';

interface ChallengeCategory {
  id: number;
  name: string;
}

interface ChallengeType {
  id: number;
  name: string;
}

interface ChallengeIntensity {
  id: number;
  name: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  category_id: number;
  type_id: number;
  intensity_id: number;
  points: number;
  duration: string;
  objective: string;
  pack_thematique: string;
  pack_id: number;
  image_path: string;
  video_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  participants_count: number;
  category?: ChallengeCategory;
  type?: ChallengeType;
  intensity?: ChallengeIntensity;
}

interface participantsParDefi {
  id: number; 
  name: string;
  email: string;
  score: number;
  rate: number;
}

interface ChallengePack {
  id: number;
  name: string;
  description: string;
  challenges_count?: number;
  created_at: string;
  updated_at: string;
}

const AdminContentPanel = () => {
  const [activeTab, setActiveTab] = useState('defis');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [isChallengeDialogOpen, setIsChallengeDialogOpen] = useState(false);
  const [isPackDialogOpen, setIsPackDialogOpen] = useState(false);
  const [challengeDialogMode, setChallengeDialogMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [packDialogMode, setPackDialogMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedPack, setSelectedPack] = useState<ChallengePack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [defis, setDefis] = useState<Challenge[]>([]);
  const [filteredDefis, setFilteredDefis] = useState<Challenge[]>([]);
  const [archivedDefis, setArchivedDefis] = useState<Challenge[]>([]);
  const [filteredArchivedDefis, setFilteredArchivedDefis] = useState<Challenge[]>([]);

  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [types, setTypes] = useState<ChallengeType[]>([]);
  const [intensities, setIntensities] = useState<ChallengeIntensity[]>([]);

  // États pour les packs
  const [packs, setPacks] = useState<ChallengePack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<ChallengePack[]>([]);
  const [searchPackTerm, setSearchPackTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: 1,
    type_id: 1,
    points: 10,
    duration: '',
    intensity_id: 1,
    objective: '',
    pack_thematique: '',
    pack_id: null,
    video_path: '',
  });

  const [packFormData, setPackFormData] = useState({
    name: '',
    description: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | number>('toutes');
  const [filterSort, setFilterSort] = useState('recent');
  const [participantsData, setParticipantsData] = useState<participantsParDefi[]>([]);
  const [isDialogParticipantOpen, setIsDialogParticipantOpen] = useState(false);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Fetch des packs
  const fetchPacks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/challenge-packs`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPacks(data);
      setFilteredPacks(data);
    } catch (err) {
      console.error('Error in fetchPacks:', err);
      // @ts-ignore
      setError(`Impossible de charger les packs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les packs
  useEffect(() => {
    if (!searchPackTerm) {
      setFilteredPacks(packs);
    } else {
      const filtered = packs.filter(pack =>
        pack.name.toLowerCase().includes(searchPackTerm.toLowerCase()) ||
        pack.description?.toLowerCase().includes(searchPackTerm.toLowerCase())
      );
      setFilteredPacks(filtered);
    }
  }, [searchPackTerm, packs]);

  // Fetch categories, types and intensities
  const fetchDropdownData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await fetch(`${API_BASE_URL}/challenge-categories`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Fetch types
      const typesRes = await fetch(`${API_BASE_URL}/challenge-types`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setTypes(typesData);
      }

      // Fetch intensities
      const intensitiesRes = await fetch(`${API_BASE_URL}/challenge-intensities`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (intensitiesRes.ok) {
        const intensitiesData = await intensitiesRes.json();
        setIntensities(intensitiesData);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };


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
  const handleRestore = async (id: number) => {
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
      // @ts-ignore
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    fetchChallenges();
    fetchArchivedChallenges();
    fetchDropdownData();
    fetchPacks();
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
      results = results.filter(defi => defi.is_active === true);
    } else if (filterStatus === 'inactif') {
      results = results.filter(defi => defi.is_active === false);
    }

    // 3. Filtre par Catégorie
    if (filterCategory !== 'toutes') {
      if (typeof filterCategory === 'number') {
        results = results.filter(defi => defi.category_id === filterCategory);
      } else if (typeof filterCategory === 'string') {
        // Fallback: try to match by category name
        results = results.filter(defi => defi.category?.name === filterCategory);
      }
    }

    // 4. Tri
    results.sort((a, b) => {
      if (filterSort === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (filterSort === 'points') return (b.points || 0) - (a.points || 0);
      if (filterSort === 'popularite') return (b.participants_count || 0) - (a.participants_count || 0);
      if (filterSort === 'ancien') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return 0;
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

  // Ouvrir le dialogue pour défis
  const openChallengeDialog = (mode: 'create' | 'edit' | 'delete', challenge: Challenge | null = null) => {
    setChallengeDialogMode(mode);
    setSelectedChallenge(challenge);
    setSelectedPack(null); // Réinitialiser le pack
    setError('');
    setSuccess('');
    setImageFile(null);
    setImagePreview(null);

    if (challenge) {
      setFormData({
        title: challenge.title || '',
        description: challenge.description || '',
        category_id: challenge.category_id || 1,
        type_id: challenge.type_id || 1,
        points: challenge.points || 10,
        duration: challenge.duration || '',
        intensity_id: challenge.intensity_id || 1,
        objective: challenge.objective || '',
        pack_thematique: challenge.pack_thematique || '',
        pack_id: challenge.pack_id || null,
        video_path: challenge.video_path || ''
      });
      
      // Afficher l'image existante si elle existe
      if (challenge.image_path && !challenge.image_path.startsWith('http')) {
        setImagePreview(`${API_BASE_URL.replace('/api', '')}/storage/${challenge.image_path}`);
      } else if (challenge.image_path) {
        setImagePreview(challenge.image_path);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        category_id: 1,
        type_id: 1,
        points: 10,
        duration: '',
        intensity_id: 1,
        objective: '',
        pack_thematique: '',
        pack_id: null,
        video_path: ''
      });
    }
    setIsChallengeDialogOpen(true);
  };

  // Ouvrir le dialogue pour packs
  const openPackDialog = (mode: 'create' | 'edit' | 'delete', pack: ChallengePack | null = null) => {
    setPackDialogMode(mode);
    setSelectedPack(pack);
    setSelectedChallenge(null); // Réinitialiser le défi
    setError('');
    setSuccess('');

    if (pack) {
      setPackFormData({
        name: pack.name || '',
        description: pack.description || ''
      });
    } else {
      setPackFormData({
        name: '',
        description: ''
      });
    }
    setIsPackDialogOpen(true);
  };

  // Fonction pour fermer le dialogue des défis
  const closeChallengeDialog = () => {
    setIsChallengeDialogOpen(false);
    // Réinitialiser les états après un court délai
    setTimeout(() => {
      setSelectedChallenge(null);
      setError('');
      setSuccess('');
      setImageFile(null);
      setImagePreview(null);
    }, 300);
  };

  // Fonction pour fermer le dialogue des packs
  const closePackDialog = () => {
    setIsPackDialogOpen(false);
    // Réinitialiser les états après un court délai
    setTimeout(() => {
      setSelectedPack(null);
      setError('');
      setSuccess('');
    }, 300);
  };

  // Gérer les changements du formulaire défis
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' ? Number(value) : value
    }));
  };

  // Gérer les changements du formulaire packs
  const handlePackInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPackFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer le changement d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Soumettre le formulaire défis
  const handleChallengeSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let url = `${API_BASE_URL}/challenges`;
      let method = 'POST';

      if (challengeDialogMode === 'edit' && selectedChallenge) {
        url = `${API_BASE_URL}/challenges/${selectedChallenge.id}`;
        method = 'PUT';
      } else if (challengeDialogMode === 'delete' && selectedChallenge) {
        url = `${API_BASE_URL}/challenges/${selectedChallenge.id}`;
        method = 'DELETE';
      }

      // Pour CREATE et UPDATE (sans image)
      const payload = challengeDialogMode !== 'delete' ? {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        type_id: formData.type_id,
        points: formData.points,
        duration: formData.duration,
        intensity_id: formData.intensity_id,
        objective: formData.objective,
        pack_thematique: formData.pack_thematique,
        pack_id: formData.pack_id,
        video_path: formData.video_path,
      } : {};

      console.log('Sending request:', { url, method, payload });

      // 1. D'abord créer/mettre à jour le défi
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: challengeDialogMode !== 'delete' ? JSON.stringify(payload) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      // 2. Ensuite uploader l'image si elle existe
      if (imageFile && challengeDialogMode !== 'delete') {
        const challengeId = challengeDialogMode === 'create' ? result.id : selectedChallenge?.id;
        
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const imageResponse = await fetch(`${API_BASE_URL}/challenges/${challengeId}/upload-image`, {
          method: 'POST',
          body: imageFormData,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!imageResponse.ok) {
          throw new Error('Erreur lors de l\'upload de l\'image');
        }
      }

      if (challengeDialogMode === 'create') {
        setSuccess('Défi créé avec succès !');
      } else if (challengeDialogMode === 'edit') {
        setSuccess('Défi mis à jour avec succès !');
      } else if (challengeDialogMode === 'delete') {
        setSuccess('Défi archivé avec succès !');
      }

      // Recharger les données
      setTimeout(() => {
        fetchChallenges();
        fetchArchivedChallenges();
        closeChallengeDialog();
        setImageFile(null);
        setImagePreview(null);
      }, 1500);

    } catch (err) {
      console.error('Submit error:', err);
      // @ts-ignore
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Soumettre le formulaire packs
  const handlePackSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let url = `${API_BASE_URL}/challenge-packs`;
      let method = 'POST';

      if (packDialogMode === 'edit' && selectedPack) {
        url = `${API_BASE_URL}/challenge-packs/${selectedPack.id}`;
        method = 'PUT';
      } else if (packDialogMode === 'delete' && selectedPack) {
        url = `${API_BASE_URL}/challenge-packs/${selectedPack.id}`;
        method = 'DELETE';
      }

      const payload = packDialogMode !== 'delete' ? {
        name: packFormData.name,
        description: packFormData.description
      } : {};

      console.log('Sending pack request:', { url, method, payload });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: packDialogMode !== 'delete' ? JSON.stringify(payload) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (packDialogMode === 'create') {
        setSuccess('Pack créé avec succès !');
      } else if (packDialogMode === 'edit') {
        setSuccess('Pack mis à jour avec succès !');
      } else if (packDialogMode === 'delete') {
        setSuccess('Pack supprimé avec succès !');
      }

      // Recharger les données
      setTimeout(() => {
        fetchPacks();
        closePackDialog();
      }, 1500);

    } catch (err) {
      console.error('Pack submit error:', err);
      // @ts-ignore
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'aide pour les statuts
  const getStatusBadge = (challenge: Challenge) => {
    const isActive = challenge.is_active;

    return isActive ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">Actif</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">Archivé</Badge>
    );
  };

  const getParticipantsParDefi = async (id_challenge: number) => {
    setLoadingParticipants(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${id_challenge}/participants`, {
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
      setLoadingParticipants(false);
    }
  };

  // Fonction pour ouvrir le dialogue des participants
  const openParticipantsDialog = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsDialogParticipantOpen(true);
    await getParticipantsParDefi(challenge.id);
  };

  // Fonction pour ouvrir la visualisation d'image
  const openImageDialog = (imageUrl: string, challengeTitle?: string) => {
    setSelectedImage(imageUrl);
    setSelectedChallenge(challengeTitle ? defis.find(d => d.title === challengeTitle) || null : null);
    setIsImageDialogOpen(true);
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
                onClick={() => {
                  fetchChallenges();
                  fetchArchivedChallenges();
                  fetchDropdownData();
                  fetchPacks();
                }}
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
                  {defis.filter(d => d.is_active).length} actifs
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Packs</p>
                <p className="text-2xl font-bold text-blue-600">{packs.length}</p>
                <p className="text-xs text-gray-500">
                  {packs.reduce((acc, pack) => acc + (pack.challenges_count || 0), 0)} défis associés
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
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
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="defis" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Défis
            </TabsTrigger>
            <TabsTrigger value="packs" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Packs Thématiques
            </TabsTrigger>
            <TabsTrigger value="archives" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archives
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
                    onClick={() => openChallengeDialog('create')}
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
                  <Select value={filterCategory.toString()} onValueChange={(v) => {
                    if (v === 'toutes') {
                      setFilterCategory('toutes');
                    } else {
                      setFilterCategory(Number(v));
                    }
                  }}>
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toutes">Toutes catégories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
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

            {loading && !isChallengeDialogOpen && !isPackDialogOpen && (
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
                        <Badge variant="outline" className="bg-purple-50">
                          {defi.category?.name || '—'}
                        </Badge>

                        <Badge variant="secondary" className="font-normal">
                          {defi.type?.name || '—'}
                        </Badge>

                        <Badge variant="secondary" className="font-normal">
                          {defi.intensity?.name || '—'}
                        </Badge>
                      </div>

                      {/* Ligne 2: Description */}
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{defi.description}"
                      </p>

                      {/* Ligne 3: Objectif et Pack Thématique */}
                      {(defi.objective || defi.pack_id) && (
                        <div className="flex flex-wrap gap-4 py-2 border-y border-gray-50">
                          {defi.objective && (
                            <div className="flex items-center text-sm text-blue-700 bg-blue-50 px-2 py-1 rounded">
                              <Target className="w-3.5 h-3.5 mr-1.5" />
                              <span className="font-medium">Objectif:</span>&nbsp;{defi.objective}
                            </div>
                          )}
                          {defi.pack_id && (
                            <div className="flex items-center text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded">
                              <Package className="w-3.5 h-3.5 mr-1.5" />
                              <span className="font-medium">Pack:</span>&nbsp;{packs.find(p => p.id === defi.pack_id)?.name || '—'}
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
                            {defi.participants_count || 0}
                          </span>
                          <span className="text-gray-600 ml-1">participants</span>
                        </Button>
                        {defi.duration && <span className="flex items-center">⏱️ {defi.duration}</span>}
                        
                        {/* Indicateurs de médias présents */}
                        <div className="flex gap-2 ml-auto md:ml-0">
                          {defi.image_path && (
                            <div 
                              className="flex items-center text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors"
                              onClick={() => {
                                const imageUrl = defi.image_path.startsWith('http') 
                                  ? defi.image_path 
                                  : `${API_BASE_URL.replace('/api', '')}/storage/${defi.image_path}`;
                                openImageDialog(imageUrl, defi.title);
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" /> 
                              {defi.image_path.startsWith('http') ? (
                                <>
                                  <span>Image URL</span>
                                  <ZoomIn className="w-3 h-3 ml-1" />
                                </>
                              ) : (
                                <>
                                  <img 
                                    src={`${API_BASE_URL.replace('/api', '')}/storage/${defi.image_path}`} 
                                    alt={defi.title}
                                    className="w-5 h-5 ml-1 rounded object-cover"
                                  />
                                  <span className="ml-1">Image</span>
                                  <ZoomIn className="w-3 h-3 ml-1" />
                                </>
                              )}
                            </div>
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
                        onClick={() => openChallengeDialog('edit', defi)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4 mr-2 md:mr-0" />
                        <span className="md:hidden">Modifier</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:bg-orange-50 border-orange-200"
                        onClick={() => openChallengeDialog('delete', defi)}
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

          {/* TAB: PACKS THÉMATIQUES */}
          <TabsContent value="packs" className="space-y-4">
            <Card className="p-4 bg-white shadow-sm border-blue-100">
              <div className="flex flex-col space-y-4">
                {/* Ligne 1: Recherche et Bouton Nouveau */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un pack..."
                      className="pl-10 border-blue-50 focus:border-blue-300"
                      value={searchPackTerm}
                      onChange={(e) => setSearchPackTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto shadow-md"
                    onClick={() => openPackDialog('create')}
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau pack
                  </Button>
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

            {loading && !isChallengeDialogOpen && !isPackDialogOpen && (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Liste des packs */}
            <div className="grid gap-4">
              {filteredPacks.map((pack) => (
                <Card key={pack.id} className="p-4 bg-white hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      
                      {/* Ligne 1: Titre et Badge */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-lg text-gray-800">{pack.name}</h3>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Package className="w-3 h-3 mr-1" />
                          Pack thématique
                        </Badge>
                      </div>

                      {/* Ligne 2: Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {pack.description || "Aucune description fournie"}
                      </p>

                      {/* Ligne 3: Stats et dates */}
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 flex-wrap">
                        <span className="flex items-center">
                          <Target className="w-3.5 h-3.5 mr-1" />
                          {pack.challenges_count || 0} défis associés
                        </span>
                        <span className="text-gray-400">
                          Créé le {new Date(pack.created_at).toLocaleDateString()}
                        </span>
                        {pack.updated_at !== pack.created_at && (
                          <span className="text-gray-400">
                            Modifié le {new Date(pack.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:bg-blue-50 border-blue-200"
                        onClick={() => openPackDialog('edit', pack)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4 mr-2 md:mr-0" />
                        <span className="md:hidden">Modifier</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => openPackDialog('delete', pack)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4 mr-2 md:mr-0" />
                        <span className="md:hidden">Supprimer</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {filteredPacks.length === 0 && !loading && (
                <Card className="p-8 text-center bg-blue-50 border-dashed border-blue-200">
                  <Package className="w-12 h-12 mx-auto text-blue-300 mb-4" />
                  <p className="text-blue-600 font-medium">Aucun pack thématique</p>
                  <p className="text-blue-500 text-sm mt-1">
                    Commencez par créer votre premier pack thématique
                  </p>
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
                        <Badge variant="secondary">
                          Archivé le {defi.deleted_at ? new Date(defi.deleted_at).toLocaleDateString() : 'Date inconnue'}
                        </Badge>
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

        {/* DIALOGUE POUR LES DÉFIS */}
        <Dialog open={isChallengeDialogOpen} onOpenChange={closeChallengeDialog}>
          <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* HEADER FIXE */}
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-xl font-bold">
                {challengeDialogMode === 'create' && 'Créer un nouveau défi'}
                {challengeDialogMode === 'edit' && 'Modifier le défi'}
                {challengeDialogMode === 'delete' && 'Archiver le défi'}
              </DialogTitle>
              <DialogDescription>
                {challengeDialogMode === 'delete' 
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

              {challengeDialogMode !== 'delete' ? (
                /* FORMULAIRE DÉFIS */
                <div className="space-y-4">
                  {/* Section: Informations de base */}
                  <div className="space-y-4">
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
                  </div>

                  <hr className="my-4" />

                  {/* Section: Paramètres techniques */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={formData.type_id.toString()} 
                        onValueChange={(v) => setFormData({...formData, type_id: Number(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map(type => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Catégorie</Label>
                      <Select 
                        value={formData.category_id.toString()} 
                        onValueChange={(v) => setFormData({...formData, category_id: Number(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Intensité</Label>
                      <Select 
                        value={formData.intensity_id.toString()} 
                        onValueChange={(v) => setFormData({...formData, intensity_id: Number(v)})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une intensité" />
                        </SelectTrigger>
                        <SelectContent>
                          {intensities.map(intensity => (
                            <SelectItem key={intensity.id} value={intensity.id.toString()}>
                              {intensity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Section: Médias et Objectifs */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="objective">Objectif du défi</Label>
                      <Input 
                        id="objective" 
                        name="objective" 
                        value={formData.objective} 
                        onChange={handleInputChange} 
                        placeholder="Ex: Réduire le stress" 
                      />
                    </div>
                    {/* <div>
                      <Label htmlFor="pack_thematique">Pack Thématique</Label>
                      <Input 
                        id="pack_thematique" 
                        name="pack_thematique" 
                        value={formData.pack_thematique} 
                        onChange={handleInputChange} 
                      />
                    </div> */}
                    <div>
                      <Label>Pack Thématique</Label>
                      <Select
                        value={formData.pack_id?.toString() ?? ''} // si null, on met ''
                        onValueChange={(v) =>
                          setFormData({
                            ...formData,
                            pack_id: v === '' ? null : Number(v), // string -> number ou null
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un pack" />
                        </SelectTrigger>
                        <SelectContent>
                          {packs.map((pack) => (
                            <SelectItem key={pack.id} value={pack.id.toString()}>
                              {pack.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Champ pour uploader une image */}
                    <div>
                      <Label htmlFor="image">Image du défi</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">Cliquez pour uploader une image</p>
                          <p className="text-xs text-gray-500 mt-1">JPEG, PNG, JPG, GIF, SVG (max 2MB)</p>
                        </label>
                      </div>
                      
                      {/* Aperçu de l'image ou image existante */}
                      {imagePreview && (
                        <div className="mt-4 relative">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-medium">Aperçu de l'image:</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveImage}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                              Supprimer
                            </Button>
                          </div>
                          <img 
                            src={imagePreview} 
                            alt="Aperçu" 
                            className="h-48 w-full object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      
                      {/* Afficher l'image existante si on est en mode édition et qu'aucune nouvelle image n'est sélectionnée */}
                      {!imagePreview && selectedChallenge?.image_path && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Image actuelle:</p>
                          <img 
                            src={
                              selectedChallenge.image_path.startsWith('http') 
                                ? selectedChallenge.image_path 
                                : `${API_BASE_URL.replace('/api', '')}/storage/${selectedChallenge.image_path}`
                            } 
                            alt={selectedChallenge.title} 
                            className="h-48 w-full object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="video_path">URL de la vidéo</Label>
                      <Input 
                        id="video_path" 
                        name="video_path" 
                        value={formData.video_path} 
                        onChange={handleInputChange} 
                        placeholder="/videos/example.mp4" 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode ARCHIVER pour défi */
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
              <Button variant="outline" onClick={closeChallengeDialog} disabled={loading}>
                Annuler
              </Button>
              <Button 
                onClick={handleChallengeSubmit} 
                disabled={loading}
                className={challengeDialogMode === 'delete' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-purple-600 hover:bg-purple-700'}
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                {challengeDialogMode === 'create' ? 'Créer le défi' : challengeDialogMode === 'edit' ? 'Sauvegarder' : 'Confirmer l\'archivage'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* DIALOGUE POUR LES PACKS */}
        <Dialog open={isPackDialogOpen} onOpenChange={closePackDialog}>
          <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* HEADER FIXE */}
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-xl font-bold">
                {packDialogMode === 'create' && 'Créer un nouveau pack'}
                {packDialogMode === 'edit' && 'Modifier le pack'}
                {packDialogMode === 'delete' && 'Supprimer le pack'}
              </DialogTitle>
              <DialogDescription>
                {packDialogMode === 'delete' 
                  ? 'Le pack sera définitivement supprimé.'
                  : 'Remplissez les informations du pack thématique ci-dessous.'}
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

              {packDialogMode !== 'delete' ? (
                /* FORMULAIRE PACKS */
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pack_name">Nom du pack *</Label>
                    <Input 
                      id="pack_name" 
                      name="name" 
                      value={packFormData.name} 
                      onChange={handlePackInputChange} 
                      placeholder="Ex: Pack Anti-stress" 
                      required 
                    />
                  </div>

                  <div>
                    <Label htmlFor="pack_description">Description</Label>
                    <Textarea 
                      id="pack_description" 
                      name="description" 
                      className="min-h-[100px]" 
                      value={packFormData.description} 
                      onChange={handlePackInputChange} 
                      placeholder="Décrivez le pack thématique..." 
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Information
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Les packs thématiques permettent de regrouper plusieurs défis autour d'une même thématique.
                      Vous pourrez ensuite associer des défis à ce pack depuis leur fiche individuelle.
                    </p>
                  </div>
                </div>
              ) : (
                /* Mode SUPPRESSION pour pack */
                <div className="py-4">
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">Confirmation de suppression</p>
                      <p className="text-sm text-red-600 mt-1">
                        Voulez-vous vraiment supprimer définitivement <strong>{selectedPack?.name}</strong> ?
                        <span className="block mt-1 font-medium">
                          Cette action est irréversible !
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER FIXE */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={closePackDialog} disabled={loading}>
                Annuler
              </Button>
              <Button 
                onClick={handlePackSubmit} 
                disabled={loading}
                className={packDialogMode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                {packDialogMode === 'create' ? 'Créer le pack' : packDialogMode === 'edit' ? 'Mettre à jour' : 'Supprimer définitivement'}
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

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogContent className="sm:max-w-4xl p-0 max-h-[90vh] overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-xl font-bold">
                {selectedChallenge?.title || 'Image du défi'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="p-6">
              <div className="relative">
                <img 
                  src={selectedImage} 
                  alt={selectedChallenge?.title || 'Image du défi'}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {selectedImage && (
                  <a 
                    href={selectedImage} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 hover:underline"
                  >
                    Ouvrir l'image dans un nouvel onglet
                  </a>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsImageDialogOpen(false)}
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