// components/Challenges/tabs/CitationsTab.tsx
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { API_BASE_URL } from '@/lib/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Quote,
  User,
  Calendar,
  Heart,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';

interface Citation {
  id: number;
  theme_id: number;
  auteur: string;
  citation: string;
  benefice: string;
  musique_url: string;
  video_url: string;
}

interface CitationTheme {
  id: number;
  theme: string;
}

const CitationsTab = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [filteredCitations, setFilteredCitations] = useState<Citation[]>([]);
  const [citationsTheme, setCitationsTheme] = useState<CitationTheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterThemes, setFilterThemes] = useState<string>('toutes'); // Correction : type string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  
  const [formData, setFormData] = useState({
    auteur: '',
    theme_id: '', // Correction : type string pour le Select
    citation: '',
    benefice: '',
    musique_url: '',
    video_url: '',
  });

  // Fetch citations
  const fetchCitations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/challenge-citations`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCitations(data);
        setFilteredCitations(data);
      } else {
        throw new Error('Erreur lors du chargement des citations');
      }
    } catch (err) {
      console.error('Error fetching citations:', err);
      setError('Erreur lors du chargement des citations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Themes
  const fetchCitationsTheme = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenge-citation-themes`);
      if (response.ok) {
        const data = await response.json();
        setCitationsTheme(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchCitations();
    fetchCitationsTheme();
  }, []);

  // Filter citations
  useEffect(() => {
    let results = [...citations];
    
    if (searchTerm) {
      results = results.filter(citation =>
        citation.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citation.auteur.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterThemes !== 'toutes') {
      // Correction : convertir en nombre pour la comparaison
      results = results.filter(citation => citation.theme_id === parseInt(filterThemes));
    }
    
    setFilteredCitations(results);
  }, [searchTerm, filterThemes, citations]);

  const openDialog = (mode: 'create' | 'edit' | 'delete', citation: Citation | null = null) => {
    setDialogMode(mode);
    setSelectedCitation(citation);
    setError('');
    
    if (citation && mode !== 'delete') {
      setFormData({
        citation: citation.citation,
        auteur: citation.auteur,
        theme_id: citation.theme_id.toString(), // Correction : convertir en string
        benefice: citation.benefice || '',
        musique_url: citation.musique_url || '',
        video_url: citation.video_url || '',
      });
    } else if (mode === 'create') {
      setFormData({
        theme_id: '',
        auteur: '',
        citation: '',
        benefice: '',
        musique_url: '',
        video_url: '',
      });
    }
    
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const url = dialogMode === 'create'
        ? `${API_BASE_URL}/challenge-citations`
        : `${API_BASE_URL}/challenge-citations/${selectedCitation?.id}`;
      
      const method = dialogMode === 'delete' ? 'DELETE' : dialogMode === 'create' ? 'POST' : 'PUT';
      
      // Préparer les données pour l'envoi
      const payload = dialogMode !== 'delete' ? {
        auteur: formData.auteur,
        theme_id: parseInt(formData.theme_id), // Convertir en nombre
        citation: formData.citation,
        benefice: formData.benefice,
        musique_url: formData.musique_url,
        video_url: formData.video_url,
      } : undefined;
      
      console.log('Sending citation:', { url, method, payload });
      
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
      
      // Recharger les citations
      fetchCitations();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving citation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour trouver le nom du thème par son ID
  const getThemeName = (themeId: number) => {
    const theme = citationsTheme.find(t => t.id === themeId);
    return theme ? theme.theme : `Thème ${themeId}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 bg-white shadow-sm border-green-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher une citation ou un auteur..."
              className="pl-10 border-green-50 focus:border-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Select value={filterThemes} onValueChange={setFilterThemes}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toutes">Toutes catégories</SelectItem>
                {citationsTheme.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCitations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <Button
            className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
            onClick={() => openDialog('create')}
            disabled={loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle citation
          </Button>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && !isDialogOpen && (
        <div className="flex justify-center py-8">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
        </div>
      )}

      {/* Citations List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCitations.map((citation) => (
          <Card key={citation.id} className="p-6 bg-gradient-to-br from-green-50 to-white border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="space-y-4">
              {/* Quote */}
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-green-200" />
                <p className="text-lg italic text-gray-700 pl-6 leading-relaxed">
                  "{citation.citation}"
                </p>
              </div>
              
              {/* Author */}
              <div className="flex items-center gap-2 text-sm text-gray-600 border-t border-green-100 pt-4">
                <User className="w-4 h-4" />
                <span className="font-semibold">{citation.auteur || "Anonyme"}</span>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-green-100">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {getThemeName(citation.theme_id)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openDialog('edit', citation)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openDialog('delete', citation)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCitations.length === 0 && !loading && (
        <Card className="p-12 text-center border-dashed border-green-300 bg-green-50">
          <Quote className="w-16 h-16 mx-auto text-green-300 mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Aucune citation trouvée</h3>
          <p className="text-green-600">
            {searchTerm || filterThemes !== 'toutes'
              ? "Essayez de modifier vos critères de recherche"
              : "Commencez par créer votre première citation positive"}
          </p>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' && 'Nouvelle citation'}
              {dialogMode === 'edit' && 'Modifier la citation'}
              {dialogMode === 'delete' && 'Supprimer la citation'}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === 'delete'
                ? 'Êtes-vous sûr de vouloir supprimer cette citation ?'
                : 'Remplissez les informations de la citation positive'}
            </DialogDescription>
          </DialogHeader>

          {dialogMode !== 'delete' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="citation">Citation *</Label>
                <Textarea
                  id="citation"
                  value={formData.citation}
                  onChange={(e) => setFormData({...formData, citation: e.target.value})}
                  placeholder="Saisissez une citation positive..."
                  className="min-h-[120px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auteur">Auteur</Label>
                <Input
                  id="auteur"
                  value={formData.auteur}
                  onChange={(e) => setFormData({...formData, auteur: e.target.value})}
                  placeholder="Nom de l'auteur"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="theme_id">Thème *</Label>
                <Select 
                  value={formData.theme_id} 
                  onValueChange={(value) => setFormData({...formData, theme_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un thème" />
                  </SelectTrigger>
                  <SelectContent>
                    {citationsTheme.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefice">Bénéfice</Label>
                <Input
                  id="benefice"
                  value={formData.benefice}
                  onChange={(e) => setFormData({...formData, benefice: e.target.value})}
                  placeholder="Bénéfice de la citation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="musique_url">URL de la musique</Label>
                <Input
                  id="musique_url"
                  value={formData.musique_url}
                  onChange={(e) => setFormData({...formData, musique_url: e.target.value})}
                  placeholder="URL de la musique associée"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video_url">URL de la vidéo</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="URL de la vidéo associée"
                />
              </div>
            </div>
          ) : (
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  La citation "{selectedCitation?.citation.substring(0, 50)}..." sera définitivement supprimée.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className={dialogMode === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {dialogMode === 'create' ? 'Créer' : dialogMode === 'edit' ? 'Sauvegarder' : 'Supprimer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitationsTab;
