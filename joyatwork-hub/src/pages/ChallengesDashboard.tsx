import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  Trophy, 
  Clock, 
  Users, 
  Zap, 
  TrendingUp,
  Calendar,
  Star,
  Play,
  CheckCircle,
  Heart,
  Brain,
  Smile,
  Activity,
  Moon,
  Edit,
  Trash2
} from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  created_at: string;
  date_created: string;
  icon: string;
  duration: string;
  color: string;
  points: number;
  participants: number;
  completion_rate: number;
}

const ChallengesDashboard = () => {
  const [activeTab, setActiveTab] = useState('mes-challenges');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour le formulaire de création de challenge
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'day'
  });

  // Chargement des challenges depuis l'API
  useEffect(() => {
    const loadChallenges = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/challenges.php');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setChallenges(data.data);
        } else {
          throw new Error(data.error || 'Erreur lors du chargement des challenges');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des challenges:', error);
        setError(error instanceof Error ? error.message : 'Erreur de connexion');
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  // Fonction pour créer un nouveau challenge
  const handleCreateChallenge = async () => {
    if (!newChallenge.title || !newChallenge.description) {
      alert('Veuillez remplir tous les champs obligatoires (Titre et Description)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/challenges.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChallenge),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Challenge créé avec succès!');
        setNewChallenge({
          title: '',
          description: '',
          type: 'day'
        });
        setIsCreateDialogOpen(false);
        
        // Recharger la liste des challenges
        const refreshResponse = await fetch('http://localhost:8080/challenges.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setChallenges(refreshData.data);
        }
      } else {
        alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour modifier un challenge
  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setNewChallenge({
      title: challenge.title,
      description: challenge.description,
      type: challenge.type
    });
    setIsEditDialogOpen(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!newChallenge.title || !newChallenge.description || !editingChallenge) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/challenges.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingChallenge.id,
          title: newChallenge.title,
          description: newChallenge.description,
          type: newChallenge.type
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Challenge modifié avec succès!');
        setNewChallenge({
          title: '',
          description: '',
          type: 'day'
        });
        setIsEditDialogOpen(false);
        setEditingChallenge(null);
        
        // Recharger la liste des challenges
        const refreshResponse = await fetch('http://localhost:8080/challenges.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setChallenges(refreshData.data);
        }
      } else {
        alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour supprimer un challenge
  const handleDeleteChallenge = async (challengeId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce challenge ?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/challenges.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: challengeId }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Challenge supprimé avec succès!');
        
        // Recharger la liste des challenges
        const refreshResponse = await fetch('http://localhost:8080/challenges.php');
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setChallenges(refreshData.data);
        }
      } else {
        alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du challenge');
    }
  };

  // Données de démonstration des challenges (maintenant remplacées par les vraies données)
  const demoFallbackChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Méditation matinale',
      description: '5 minutes de méditation guidée pour bien commencer la journée',
      category: 'Émotion',
      duration: '5 min',
      type: 'individuel',
      intensity: 'léger',
      points: 10,
      status: 'en_cours',
      participants: 1,
      icon: '🧘',
      objective: 'Réduction stress'
    },
    {
      id: '2',
      title: 'Pause active équipe',
      description: 'Exercices de stretching en groupe pendant la pause',
      category: 'Mouvement',
      duration: '15 min',
      type: 'collectif',
      intensity: 'moyen',
      points: 25,
      status: 'disponible',
      participants: 12,
      icon: '🤸',
      objective: 'Cohésion équipe'
    },
    {
      id: '3',
      title: 'Hydratation consciente',
      description: 'Boire 8 verres d\'eau dans la journée avec mindfulness',
      category: 'Énergie',
      duration: '1 jour',
      type: 'silencieux',
      intensity: 'léger',
      points: 15,
      status: 'terminé',
      participants: 8,
      icon: '💧',
      objective: 'Autonomie'
    },
    {
      id: '4',
      title: 'Gratitude express',
      description: 'Noter 3 éléments positifs de sa journée',
      category: 'Émotion',
      duration: '3 min',
      type: 'express',
      intensity: 'léger',
      points: 8,
      status: 'disponible',
      participants: 15,
      icon: '🙏',
      objective: 'Bien-être mental'
    },
    {
      id: '5',
      title: 'Focus deep work',
      description: '25 minutes de travail concentré sans distraction',
      category: 'Focus',
      duration: '25 min',
      type: 'individuel',
      intensity: 'engageant',
      points: 30,
      status: 'en_cours',
      participants: 6,
      icon: '🎯',
      objective: 'Productivité'
    },
    {
      id: '6',
      title: 'Sommeil optimisé',
      description: 'Routine de coucher sans écran 30min avant le sommeil',
      category: 'Sommeil',
      duration: '1 semaine',
      type: 'individuel',
      intensity: 'moyen',
      points: 50,
      status: 'disponible',
      participants: 4,
      icon: '🌙',
      objective: 'Récupération'
    }
  ];

  const stats = {
    total_challenges: challenges.length,
    challenges_completed: Math.floor(challenges.length * 0.3), // 30% des challenges considérés comme complétés
    challenges_in_progress: Math.floor(challenges.length * 0.4), // 40% en cours
    total_points: challenges.reduce((sum, challenge) => sum + challenge.points, 0),
    participation_rate: challenges.length > 0 ? Math.round(challenges.reduce((sum, c) => sum + c.completion_rate, 0) / challenges.length) : 0,
    weekly_activity: 85
  };

  // Fonctions helper supprimées - remplacées par les données de l'API

  // Gestion du chargement et des erreurs
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-red-700">Erreur: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Challenges Bien-être</h1>
            <p className="text-gray-600">Relevez des défis pour améliorer votre qualité de vie au travail</p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Target className="w-4 h-4 mr-2" />
              Créer un challenge
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Challenges</p>
                <p className="text-3xl font-bold text-purple-900">{stats.total_challenges}</p>
                <p className="text-sm text-purple-600">+2 cette semaine</p>
              </div>
              <Target className="w-12 h-12 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Terminés</p>
                <p className="text-3xl font-bold text-green-900">{stats.challenges_completed}</p>
                <p className="text-sm text-green-600">Taux: 17%</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Points Gagnés</p>
                <p className="text-3xl font-bold text-orange-900">{stats.total_points}</p>
                <p className="text-sm text-orange-600">+25 cette semaine</p>
              </div>
              <Star className="w-12 h-12 text-orange-600" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Participation</p>
                <p className="text-3xl font-bold text-blue-900">{stats.participation_rate}%</p>
                <p className="text-sm text-blue-600">+5% vs mois dernier</p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mes-challenges">Mes Challenges</TabsTrigger>
            <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
            <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="mes-challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{challenge.icon}</span>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {challenge.duration}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{challenge.points}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{challenge.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditChallenge(challenge)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Play className="w-4 h-4 mr-1" />
                          Commencer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="disponibles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-dashed border-gray-200 hover:border-purple-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{challenge.icon}</span>
                        <Badge variant="outline" className="text-purple-600 border-purple-300">
                          {challenge.date_created}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{challenge.points}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{challenge.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>{challenge.completion_rate}% de réussite</span>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Target className="w-4 h-4 mr-1" />
                        Commencer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="statistiques" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Progression hebdomadaire</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Activité cette semaine</span>
                      <span>{stats.weekly_activity}%</span>
                    </div>
                    <Progress value={stats.weekly_activity} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Objectifs atteints</span>
                      <span>6/8</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Régularité</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Répartition par type</h3>
                <div className="space-y-3">
                  {['day', 'week', 'month'].map((type, index) => {
                    const count = challenges.filter(c => c.type === type).length;
                    const percentage = challenges.length > 0 ? (count / challenges.length) * 100 : 0;
                    const typeName = type === 'day' ? 'Quotidien' : type === 'week' ? 'Hebdomadaire' : 'Mensuel';
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="text-sm">{typeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={percentage} className="h-1 w-20" />
                          <span className="text-sm text-gray-600">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Dialog de création de challenge */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau challenge</DialogTitle>
              <DialogDescription>
                Créez un challenge pour améliorer le bien-être au travail.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Titre du challenge *</Label>
                <Input
                  id="title"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Méditation matinale"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre challenge et ses bénéfices..."
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type de challenge</Label>
                <Select value={newChallenge.type} onValueChange={(value) => setNewChallenge(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">☀️ Quotidien (10 points)</SelectItem>
                    <SelectItem value="week">📅 Hebdomadaire (50 points)</SelectItem>
                    <SelectItem value="month">🗓️ Mensuel (200 points)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateChallenge} disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le challenge'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Dialog de modification de challenge */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le challenge</DialogTitle>
              <DialogDescription>
                Modifiez les informations de votre challenge.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Titre du challenge *</Label>
                <Input
                  id="edit-title"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Méditation matinale"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <textarea
                  id="edit-description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre challenge et ses bénéfices..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Type de challenge</Label>
                <Select value={newChallenge.type} onValueChange={(value) => setNewChallenge(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">☀️ Quotidien (10 points)</SelectItem>
                    <SelectItem value="week">📅 Hebdomadaire (50 points)</SelectItem>
                    <SelectItem value="month">🗓️ Mensuel (200 points)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingChallenge(null);
                setNewChallenge({ title: '', description: '', type: 'day' });
              }}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                {isSubmitting ? 'Modification...' : 'Sauvegarder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChallengesDashboard;
