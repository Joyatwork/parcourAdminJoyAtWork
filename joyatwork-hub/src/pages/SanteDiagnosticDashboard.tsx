import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { AcroFormTextField, jsPDF } from 'jspdf';
import { 
  Heart,
  Activity,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Zap,
  Moon,
  Smile,
  Target,
  FileText,
  BarChart3,
  User,
  Shield,
  Search,
  Loader2,
  Building2,
  Users,
  Plus,
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Pencil,
  Eye,
  Download
} from 'lucide-react';

interface DiagnosticResult {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  category: string;
  status: 'excellent' | 'bon' | 'moyen' | 'attention' | 'critique';
  date: string;
  recommendations: string[];
}

interface CompanyOption {
  id: number;
  name: string;
}

interface UserOption {
  id: number;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  entreprise_id?: number | null;
}

interface CreateDiagnosticForm {
  company_id: string;
  user_id: string;
  questionnaire: string;
  period_month: string;
  period_year: string;
  stress_level: string;
  energy_level: string;
  sleep_level: string;
  mood_level: string;
  work_pressure: string;
}

interface QuestionnaireSection {
  id: string;
  title: string;
  completed: boolean;
  score: number;
  maxScore: number;
  questions: number;
}

type QuestionnaireQuestionType = 'rating' | 'text' | 'single_choice';

interface QuestionnaireQuestion {
  id: string;
  label: string;
  type: QuestionnaireQuestionType;
  maxScore: number;
  required: boolean;
  options: string[];
}

interface QuestionnaireTemplateSection {
  id: string;
  title: string;
  questions: QuestionnaireQuestion[];
}

interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  usageCount: number;
  archived: boolean;
  createdByUserId: number | null;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  sections: QuestionnaireTemplateSection[];
}

interface QuestionnaireEditorState {
  name: string;
  description: string;
  sections: QuestionnaireTemplateSection[];
}

interface CompanyHealthData {
  entreprise_id?: number;
  company_name: string;
  month: string;
  avg_stress: number;
  avg_energy: number;
  avg_sleep: number;
  avg_mood: number;
  avg_pressure: number;
}

interface UserHealthData {
  user_id?: number;
  first_name: string;
  last_name: string;
  display_name?: string;
  company_name: string;
  month: string;
  avg_stress: number;
  avg_energy: number;
  avg_sleep: number;
  avg_mood: number;
  avg_pressure: number;
}

interface GlobalStats {
  moyen_stress: number;
  moyen_energie: number;
  moyen_sommeil: number;
  moyen_mood: number;
  moyen_pression: number;
}

const SanteDiagnosticDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companyHealthData, setCompanyHealthData] = useState<CompanyHealthData[]>([]);
  const [usersHealthData, setUsersHealthData] = useState<UserHealthData[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingDiagnostic, setIsCreatingDiagnostic] = useState(false);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  const [tableMonth, setTableMonth] = useState(0);
  const [tableYear, setTableYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");

  const [globalMonth, setGlobalMonth] = useState(new Date().getMonth() + 1);
  const [globalYear, setGlobalYear] = useState(new Date().getFullYear());

  const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const parseJsonSafe = async (res: Response) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.error('Invalid JSON response from', (res as any)?.url ?? 'unknown', text);
      return null;
    }
  };

  const createDefaultQuestion = (label: string, type: QuestionnaireQuestionType = 'rating'): QuestionnaireQuestion => ({
    id: buildId(),
    label,
    type,
    maxScore: type === 'text' ? 0 : 10,
    required: true,
    options: type === 'single_choice' ? ['Option 1', 'Option 2'] : [],
  });

  const createDefaultSection = (title: string): QuestionnaireTemplateSection => ({
    id: buildId(),
    title,
    questions: [createDefaultQuestion('Nouvelle question')],
  });

  const mapApiDiagnostic = (d: any, companiesList: CompanyOption[] = []): DiagnosticResult => {
    const metrics = [d.stress_level, d.energy_level, d.work_pressure, d.answers?.avg_sleep, d.answers?.avg_mood]
      .filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)))
      .map(Number);
    const avgScore = metrics.length > 0
      ? Math.round(metrics.reduce((s, v) => s + v, 0) / metrics.length * 10) : 0;
    const q = d.answers?.questionnaire ?? 'Diagnostic';
    const ctype = d.answers?.creation_type ?? d.scope ?? 'questionnaire';
    let category = 'Questionnaire';
    if (ctype === 'company_diagnostic') {
      const companyId = Number(d.answers?.company_id ?? 0) || null;
      const companyName = companyId
        ? (companiesList.find((c) => c.id === companyId)?.name ?? `Entreprise #${companyId}`)
        : 'Entreprise';
      category = `Entreprise : ${companyName}`;
    } else if (ctype === 'user_diagnostic') {
      category = 'Utilisateur';
    }
    return {
      id: String(d.id),
      title: `Auto-diagnostic - ${q}`,
      score: avgScore,
      maxScore: 100,
      category,
      status: getStatusFromScore(avgScore),
      date: (d.completed_at ?? d.created_at ?? '').slice(0, 10),
      recommendations: ['Analyse en cours par le service RH', 'Programmer un suivi dans 15 jours'],
    };
  };

  const mapApiTemplate = (raw: any): QuestionnaireTemplate => ({
    id: String(raw.id),
    name: raw.name,
    description: raw.description ?? '',
    sections: Array.isArray(raw.sections) ? raw.sections : [],
    usageCount: raw.usage_count ?? 0,
    archived: Boolean(raw.archived),
    createdByUserId: Number(raw.created_by_user_id ?? 0) || null,
    createdByName: String(raw.created_by_name ?? '').trim(),
    createdAt: raw.created_at ? raw.created_at.slice(0, 10) : '',
    updatedAt: raw.updated_at ? raw.updated_at.slice(0, 10) : '',
  });

  const [questionnaireLibrary, setQuestionnaireLibrary] = useState<QuestionnaireTemplate[]>([]);
  const [questionnaireLoading, setQuestionnaireLoading] = useState(false);

  const fetchQuestionnaires = async () => {
    setQuestionnaireLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/questionnaire-templates`);
      const data = await res.json();
      setQuestionnaireLibrary(Array.isArray(data) ? data.map(mapApiTemplate) : []);
    } catch (err) {
      console.error('Erreur chargement questionnaires:', err);
    } finally {
      setQuestionnaireLoading(false);
    }
  };

  const [questionnaireEditId, setQuestionnaireEditId] = useState<string | null>(null);
  const [questionnairePreviewId, setQuestionnairePreviewId] = useState<string | null>(null);
  const [isQuestionnairePreviewOpen, setIsQuestionnairePreviewOpen] = useState(false);
  const [showArchivedQuestionnaires, setShowArchivedQuestionnaires] = useState(false);
  const [questionnaireEditor, setQuestionnaireEditor] = useState<QuestionnaireEditorState>({
    name: '',
    description: '',
    sections: [createDefaultSection('Nouvelle section')],
  });

  const questionnaireOptions = questionnaireLibrary
    .filter((questionnaire) => !questionnaire.archived)
    .map((questionnaire) => questionnaire.name);

  const [createForm, setCreateForm] = useState<CreateDiagnosticForm>({
    company_id: '',
    user_id: '',
    questionnaire: '',
    period_month: String(new Date().getMonth() + 1),
    period_year: String(new Date().getFullYear()),
    stress_level: '',
    energy_level: '',
    sleep_level: '',
    mood_level: '',
    work_pressure: '',
  });

  const months = [
    { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' }, { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' }, { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' }, { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
  ];

  const activeQuestionnaires = questionnaireLibrary.filter((questionnaire) => !questionnaire.archived);
  const archivedQuestionnaires = questionnaireLibrary.filter((questionnaire) => questionnaire.archived);
  const totalQuestionCount = questionnaireLibrary.reduce(
    (sum, questionnaire) => sum + questionnaire.sections.reduce((sectionSum, section) => sectionSum + section.questions.length, 0),
    0
  );

  // Résultats des diagnostics précédents
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'bon': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'moyen': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'attention': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critique': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'bon': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'moyen': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'attention': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'critique': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    if (percentage >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusFromScore = (score: number): DiagnosticResult['status'] => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'bon';
    if (score >= 40) return 'moyen';
    if (score >= 20) return 'attention';
    return 'critique';
  };

  const getUserDisplayName = (user: UserOption) => {
    const fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
    return fullName || user.name || `Utilisateur #${user.id}`;
  };

  const connectedAdmin = (() => {
    try {
      const rawUser = localStorage.getItem('user');
      const parsed = rawUser ? JSON.parse(rawUser) : null;
      const userId = Number(parsed?.id ?? 0) || null;
      const firstName = String(parsed?.first_name ?? '').trim();
      const lastName = String(parsed?.last_name ?? '').trim();
      const legacyName = String(parsed?.name ?? '').trim();
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || legacyName || 'Administrateur';
      return { id: userId, name: fullName };
    } catch {
      return { id: null as number | null, name: 'Administrateur' };
    }
  })();

  const getUserNameParts = (user: UserOption | null) => {
    if (!user) {
      return { firstName: 'Utilisateur', lastName: '' };
    }

    const firstName = (user.first_name ?? '').trim();
    const lastName = (user.last_name ?? '').trim();
    if (firstName || lastName) {
      return {
        firstName: firstName || 'Utilisateur',
        lastName,
      };
    }

    const displayName = (user.name ?? '').trim();
    if (displayName) {
      const chunks = displayName.split(' ');
      return {
        firstName: chunks[0] || 'Utilisateur',
        lastName: chunks.slice(1).join(' '),
      };
    }

    return { firstName: `Utilisateur`, lastName: `#${user.id}` };
  };

  const getSectionCreationType = (): 'questionnaire' | 'user_diagnostic' | 'company_diagnostic' => {
    if (activeTab === 'entreprises') return 'company_diagnostic';
    if (activeTab === 'users') return 'user_diagnostic';
    return 'questionnaire';
  };

  const sectionCreationType = getSectionCreationType();

  const getCompanyDisplayName = (companyId: number | null | undefined) => {
    if (!companyId) return 'Entreprise';
    return companies.find((company) => company.id === companyId)?.name || `Entreprise #${companyId}`;
  };

  // Fonction pour calculer le score global
  const calculateGlobalScore = (stats: GlobalStats | null) => {
    if (!stats) return 0;
    const { moyen_energie, moyen_mood, moyen_sommeil, moyen_stress } = stats;
    return Math.round(
      ((Number(moyen_energie) + Number(moyen_mood) + Number(moyen_sommeil) + (10 - Number(moyen_stress))) / 4) * 10
    );
  };

  // Fonction pour obtenir le trend
  const getTrend = () => {
    // Simuler un trend positif pour l'exemple
    return '+8%';
  };

  useEffect(() => {
    const initData = async () => {
      try {
        setInitialLoading(true);
        const [resCompany, resUser, resGlobal] = await Promise.all([
          fetch(`${API_BASE_URL}/diagnostics/company-health`),
          fetch(`${API_BASE_URL}/diagnostics/user-health`),
          fetch(`${API_BASE_URL}/kpi-company-health/global-health?year=${globalYear}&month=${globalMonth}`)
        ]);

        const [resCompanies, resUsers] = await Promise.all([
          fetch(`${API_BASE_URL}/companies`),
          fetch(`${API_BASE_URL}/users`),
        ]);
        
        const companyData = await parseJsonSafe(resCompany) ?? [];
        const userData = await parseJsonSafe(resUser) ?? [];
        const globalData = await parseJsonSafe(resGlobal) ?? [];
        const companiesData = await parseJsonSafe(resCompanies) ?? [];
        const usersData = await parseJsonSafe(resUsers) ?? [];
        
        setCompanyHealthData(companyData);
        setUsersHealthData(userData);
        setGlobalStats(globalData.length > 0 ? globalData[0] : null);
        const validCompanies: CompanyOption[] = Array.isArray(companiesData) ? companiesData : [];
        setCompanies(validCompanies);
        setUsers(Array.isArray(usersData) ? usersData : []);

        // Chargement de l'historique des diagnostics
        try {
          const resD = await fetch(`${API_BASE_URL}/diagnostics`);
          const rawText = await resD.text();
          if (!rawText) {
            console.warn('Empty response from /diagnostics');
          }
          try {
            // try to parse JSON from the raw text
            const parsed = rawText ? JSON.parse(rawText) : null;
            setDiagnosticResults(Array.isArray(parsed) ? parsed.map((d: any) => mapApiDiagnostic(d, validCompanies)) : []);
          } catch (err) {
            console.error('/diagnostics returned non-JSON:', rawText);
            setDiagnosticResults([]);
          }
        } catch (err) {
          console.error('Erreur chargement historique:', err);
        }

        // Chargement des questionnaires
        try {
          const resQ = await fetch(`${API_BASE_URL}/questionnaire-templates`);
          const qData = await parseJsonSafe(resQ);
          setQuestionnaireLibrary(Array.isArray(qData) ? qData.map(mapApiTemplate) : []);
        } catch (err) {
          console.error('Erreur chargement questionnaires:', err);
        }
      } catch (err) { 
        console.error('Erreur lors du chargement des données:', err); 
      } finally { 
        setInitialLoading(false); 
      }
    };
    initData();
  }, []);

  useEffect(() => {
    if (initialLoading) return;
    const updateStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/kpi-company-health/global-health?year=${globalYear}&month=${globalMonth}`
        );
        const globalData = await parseJsonSafe(res) ?? [];
        setGlobalStats(Array.isArray(globalData) && globalData.length > 0 ? globalData[0] : null);
      } catch (err) { 
        console.error('Erreur lors de la mise à jour des stats:', err); 
      } finally { 
        setTimeout(() => setStatsLoading(false), 300); 
      }
    };
    updateStats();
  }, [globalMonth, globalYear]);

  useEffect(() => {
    const list = showArchivedQuestionnaires ? archivedQuestionnaires : activeQuestionnaires;
    if (list.length === 0) {
      setQuestionnairePreviewId(null);
      return;
    }

    const existsInVisibleList = list.some((questionnaire) => questionnaire.id === questionnairePreviewId);
    if (!existsInVisibleList) {
      setQuestionnairePreviewId(list[0].id);
    }
  }, [showArchivedQuestionnaires, questionnaireLibrary, questionnairePreviewId]);

  const filterLogic = (data: any[], searchKey: string) => {
    return data.filter(item => {
      const matchYear = item.month.startsWith(tableYear.toString());
      const monthStr = String(tableMonth).padStart(2, '0');
      const matchMonth = tableMonth === 0 ? true : item.month === `${tableYear}-${monthStr}`;
      const searchTarget = searchKey === 'user' 
        ? `${item.first_name} ${item.last_name}`.toLowerCase() 
        : item.company_name.toLowerCase();
      return matchYear && matchMonth && searchTarget.includes(searchTerm.toLowerCase());
    });
  };

  const filteredCompanies = filterLogic(companyHealthData, 'company');
  const filteredUsers = filterLogic(usersHealthData, 'user');

  const stats = globalStats || { 
    moyen_stress: 0, 
    moyen_energie: 0, 
    moyen_sommeil: 0, 
    moyen_mood: 0, 
    moyen_pression: 0 
  };

  const globalScore = calculateGlobalScore(stats);
  const trend = getTrend();

  const selectedCompanyId = createForm.company_id ? Number(createForm.company_id) : null;
  const selectedUser = createForm.user_id
    ? users.find((user) => user.id === Number(createForm.user_id))
    : null;

  const resolvedCompanyId =
    sectionCreationType === 'user_diagnostic'
      ? (createForm.company_id ? Number(createForm.company_id) : null)
      : selectedCompanyId;

  const selectableUsers = users.filter((user) => {
    if (!resolvedCompanyId) {
      return true;
    }
    return Number(user.entreprise_id ?? 0) === resolvedCompanyId;
  });

  const selectedQuestionnaire = questionnairePreviewId
    ? questionnaireLibrary.find((questionnaire) => questionnaire.id === questionnairePreviewId) ?? null
    : activeQuestionnaires[0] ?? null;

  const openQuestionnaireCreateDialog = () => {
    setQuestionnaireEditId(null);
    setQuestionnaireEditor({
      name: createForm.questionnaire.trim(),
      description: '',
      sections: [createDefaultSection('Nouvelle section')],
    });
    setIsCreateDialogOpen(true);
  };

  const openQuestionnaireEditDialog = (questionnaire: QuestionnaireTemplate) => {
    setQuestionnaireEditId(questionnaire.id);
    setQuestionnaireEditor({
      name: questionnaire.name,
      description: questionnaire.description,
      sections: questionnaire.sections.map((section) => ({
        ...section,
        questions: section.questions.map((question) => ({ ...question, options: [...question.options] })),
      })),
    });
    setIsCreateDialogOpen(true);
  };

  const updateQuestionnaireSection = (sectionId: string, patch: Partial<QuestionnaireTemplateSection>) => {
    setQuestionnaireEditor((previous) => ({
      ...previous,
      sections: previous.sections.map((section) => (
        section.id === sectionId ? { ...section, ...patch } : section
      )),
    }));
  };

  const addQuestionnaireSection = () => {
    setQuestionnaireEditor((previous) => ({
      ...previous,
      sections: [...previous.sections, createDefaultSection(`Section ${previous.sections.length + 1}`)],
    }));
  };

  const removeQuestionnaireSection = (sectionId: string) => {
    setQuestionnaireEditor((previous) => {
      if (previous.sections.length <= 1) {
        return previous;
      }
      return {
        ...previous,
        sections: previous.sections.filter((section) => section.id !== sectionId),
      };
    });
  };

  const addQuestionToSection = (sectionId: string) => {
    setQuestionnaireEditor((previous) => ({
      ...previous,
      sections: previous.sections.map((section) => (
        section.id === sectionId
          ? {
              ...section,
              questions: [...section.questions, createDefaultQuestion(`Question ${section.questions.length + 1}`)],
            }
          : section
      )),
    }));
  };

  const removeQuestionFromSection = (sectionId: string, questionId: string) => {
    setQuestionnaireEditor((previous) => ({
      ...previous,
      sections: previous.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        if (section.questions.length <= 1) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.filter((question) => question.id !== questionId),
        };
      }),
    }));
  };

  const updateQuestionInSection = (
    sectionId: string,
    questionId: string,
    patch: Partial<QuestionnaireQuestion>
  ) => {
    setQuestionnaireEditor((previous) => ({
      ...previous,
      sections: previous.sections.map((section) => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id !== questionId) {
              return question;
            }
            return {
              ...question,
              ...patch,
            };
          }),
        };
      }),
    }));
  };

  const duplicateQuestionnaire = async (questionnaire: QuestionnaireTemplate) => {
    try {
      const res = await fetch(`${API_BASE_URL}/questionnaire-templates/${questionnaire.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          created_by_user_id: connectedAdmin.id,
          created_by_name: connectedAdmin.name,
        }),
      });
      if (!res.ok) throw new Error();
      const raw = await res.json();
      const duplicate = mapApiTemplate(raw);
      setQuestionnaireLibrary((prev) => [duplicate, ...prev]);
      setQuestionnairePreviewId(duplicate.id);
      toast({ title: 'Questionnaire dupliqué', description: `${questionnaire.name} a été dupliqué avec succès.` });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de dupliquer le questionnaire.' });
    }
  };

  const toggleArchiveQuestionnaire = async (questionnaireId: string, archived: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/questionnaire-templates/${questionnaireId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error();
      const raw = await res.json();
      setQuestionnaireLibrary((prev) => prev.map((q) => q.id === questionnaireId ? mapApiTemplate(raw) : q));
      if (archived && selectedQuestionnaire?.id === questionnaireId) setQuestionnairePreviewId(null);
      toast({
        title: archived ? 'Questionnaire archivé' : 'Questionnaire restauré',
        description: archived ? 'Déplacé dans les archives.' : 'De nouveau actif.',
      });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de modifier le questionnaire.' });
    }
  };

  const deleteQuestionnaire = async (questionnaireId: string) => {
    const questionnaire = questionnaireLibrary.find((item) => item.id === questionnaireId);
    if (!questionnaire) return;
    try {
      const res = await fetch(`${API_BASE_URL}/questionnaire-templates/${questionnaireId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();
      setQuestionnaireLibrary((prev) => prev.filter((item) => item.id !== questionnaireId));
      if (selectedQuestionnaire?.id === questionnaireId) setQuestionnairePreviewId(null);
      toast({ title: 'Questionnaire supprimé', description: `${questionnaire.name} a été supprimé définitivement.` });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le questionnaire.' });
    }
  };

  const deleteCompanyHealthRow = async (item: CompanyHealthData) => {
    const companyId = Number(item.entreprise_id ?? 0) || null;
    if (!companyId) {
      toast({ variant: 'destructive', title: 'Suppression impossible', description: 'Identifiant entreprise introuvable.' });
      return;
    }
    if (!window.confirm(`Supprimer les diagnostics entreprise pour ${item.company_name} (${item.month}) ?`)) {
      return;
    }

    try {
      const params = new URLSearchParams({ company_id: String(companyId), month: item.month });
      const res = await fetch(`${API_BASE_URL}/diagnostics/company-health?${params.toString()}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();

      setCompanyHealthData((prev) => prev.filter((row) => !(row.entreprise_id === item.entreprise_id && row.month === item.month)));
      toast({ title: 'Entrée supprimée', description: 'Les diagnostics entreprise ont été supprimés de la base.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer cette entrée entreprise.' });
    }
  };

  const deleteUserHealthRow = async (item: UserHealthData) => {
    const userId = Number(item.user_id ?? 0) || null;
    if (!userId) {
      toast({ variant: 'destructive', title: 'Suppression impossible', description: 'Identifiant utilisateur introuvable.' });
      return;
    }
    if (!window.confirm(`Supprimer les diagnostics utilisateur (${item.month}) ?`)) {
      return;
    }

    try {
      const params = new URLSearchParams({ user_id: String(userId), month: item.month });
      const res = await fetch(`${API_BASE_URL}/diagnostics/user-health?${params.toString()}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error();

      setUsersHealthData((prev) => prev.filter((row) => !(row.user_id === item.user_id && row.month === item.month)));
      toast({ title: 'Entrée supprimée', description: 'Les diagnostics utilisateur ont été supprimés de la base.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer cette entrée utilisateur.' });
    }
  };

  const downloadQuestionnairePdf = (questionnaire: QuestionnaireTemplate) => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = 18;
      let fieldIndex = 0;

      const ensureSpace = (requiredHeight: number) => {
        if (cursorY + requiredHeight <= pageHeight - margin) return;
        doc.addPage();
        cursorY = margin;
      };

      const writeBlock = (text: string, fontSize = 11, indent = 0, extraGap = 2, color?: [number, number, number]) => {
        doc.setFontSize(fontSize);
        if (color) {
          doc.setTextColor(color[0], color[1], color[2]);
        } else {
          doc.setTextColor(31, 41, 55);
        }
        const lines = doc.splitTextToSize(text, contentWidth - indent);
        const lineHeight = fontSize * 0.42 + 1.2;
        ensureSpace(lines.length * lineHeight + extraGap);
        doc.text(lines, margin + indent, cursorY);
        cursorY += lines.length * lineHeight + extraGap;
      };

    const drawTextField = (x: number, y: number, width: number, height: number, multiline = false) => {
  const field = new AcroFormTextField();
  field.fieldName = `question_${fieldIndex++}`;
  field.x = x;
  field.y = y;
  field.width = width;
  field.height = height;
  field.fontSize = 10;
  field.textAlign = 'left';
  // field.borderStyle = 'solid';  <-- supprimé
  field.multiline = multiline;
  field.hasAppearanceStream = true;
  field.color = '#1f2937';
  doc.addField(field);
};

      const getQuestionTypeLabel = (type: QuestionnaireQuestionType) => {
        if (type === 'rating') return 'Note';
        if (type === 'text') return 'Texte';
        return 'Choix unique';
      };

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      writeBlock(questionnaire.name, 18, 0, 4, [17, 24, 39]);

      doc.setFont('helvetica', 'normal');
      writeBlock(questionnaire.description || 'Aucune description', 11, 0, 3, [75, 85, 99]);
      writeBlock(`Cree le ${questionnaire.createdAt}  |  Mis a jour le ${questionnaire.updatedAt}`, 9, 0, 5, [107, 114, 128]);

      questionnaire.sections.forEach((section, sectionIndex) => {
        ensureSpace(24);
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 5;

        doc.setFont('helvetica', 'bold');
        writeBlock(`${sectionIndex + 1}. ${section.title}`, 13, 0, 2, [17, 24, 39]);
        doc.setFont('helvetica', 'normal');
        writeBlock(`${section.questions.length} question(s)`, 9, 0, 3, [59, 130, 246]);

        section.questions.forEach((question, questionIndex) => {
          ensureSpace(question.type === 'text' ? 34 : question.type === 'single_choice' ? 24 : 22);

          doc.setDrawColor(229, 231, 235);
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(margin, cursorY, contentWidth, question.type === 'text' ? 30 : question.type === 'single_choice' ? 22 : 20, 2, 2, 'FD');
          cursorY += 5;

          const questionMeta = `${getQuestionTypeLabel(question.type)}${question.type !== 'text' ? ` • ${question.maxScore} pts` : ''}${question.required ? ' • Obligatoire' : ''}`;
          writeBlock(`${sectionIndex + 1}.${questionIndex + 1} ${question.label}`, 11, 3, 1, [17, 24, 39]);
          writeBlock(questionMeta, 9, 7, 2, [107, 114, 128]);

          if (question.type === 'rating') {
            const boxSize = 7;
            const gap = 1.8;
            const totalWidth = boxSize * 10 + gap * 9;
            const startX = margin + 8;
            const scaleY = cursorY + 1;

            for (let index = 0; index < 10; index += 1) {
              const x = startX + index * (boxSize + gap);
              doc.setDrawColor(209, 213, 219);
              doc.roundedRect(x, scaleY, boxSize, boxSize, 1.2, 1.2, 'S');
              doc.setFontSize(8);
              doc.setTextColor(75, 85, 99);
              doc.text(String(index + 1), x + boxSize / 2, scaleY + 4.6, { align: 'center' });
            }

            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            doc.text('Votre note', margin + 8, scaleY + 11.5);
            drawTextField(margin + 30, scaleY + 8.2, 18, 7);
            cursorY = scaleY + 15;
          }

          if (question.type === 'single_choice' && question.options.length > 0) {
            const optionsStartY = cursorY;
            question.options.forEach((option, optionIndex) => {
              const optionY = optionsStartY + optionIndex * 5.5;
              doc.setDrawColor(156, 163, 175);
              doc.circle(margin + 11, optionY, 1.6, 'S');
              doc.setFontSize(9);
              doc.setTextColor(55, 65, 81);
              doc.text(option, margin + 16, optionY + 1);
            });
            cursorY = optionsStartY + question.options.length * 5.5 + 1;
            writeBlock('Votre reponse', 9, 7, 1, [107, 114, 128]);
            drawTextField(margin + 8, cursorY, contentWidth - 16, 7);
            cursorY += 10;
          }

          if (question.type === 'text') {
            writeBlock('Votre reponse', 9, 7, 1, [107, 114, 128]);
            drawTextField(margin + 8, cursorY, contentWidth - 16, 14, true);
            cursorY += 17;
          }

          cursorY += 2;
        });
      });

      const safeFileName = questionnaire.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

      doc.save(`${safeFileName || 'questionnaire'}.pdf`);
      toast({ title: 'PDF telecharge', description: 'Le questionnaire a ete exporte en PDF.' });
    } catch (error) {
      console.error('Erreur export PDF questionnaire:', error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de generer le PDF du questionnaire.' });
    }
  };

  const handleCreateDiagnostic = async () => {
    if (!['entreprises', 'users', 'questionnaire'].includes(activeTab)) {
      toast({
        variant: 'destructive',
        title: 'Section non compatible',
        description: 'Allez dans les onglets Entreprises, Utilisateurs ou Questionnaire pour créer un élément.',
      });
      return;
    }

    if (sectionCreationType === 'questionnaire') {
      if (!questionnaireEditor.name.trim()) {
        toast({
          variant: 'destructive',
          title: 'Nom requis',
          description: 'Renseignez le nom du questionnaire.',
        });
        return;
      }

      if (questionnaireEditor.sections.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Section requise',
          description: 'Ajoutez au moins une section au questionnaire.',
        });
        return;
      }

      const hasEmptyQuestionLabel = questionnaireEditor.sections.some((section) => (
        section.questions.length === 0 || section.questions.some((question) => !question.label.trim())
      ));

      if (hasEmptyQuestionLabel) {
        toast({
          variant: 'destructive',
          title: 'Question invalide',
          description: 'Chaque section doit contenir au moins une question avec un libellé.',
        });
        return;
      }

      setIsCreatingDiagnostic(true);
      try {
        const payload = {
          name: questionnaireEditor.name.trim(),
          description: questionnaireEditor.description.trim(),
          sections: questionnaireEditor.sections,
          created_by_user_id: connectedAdmin.id,
          created_by_name: connectedAdmin.name,
        };

        if (questionnaireEditId) {
          const res = await fetch(`${API_BASE_URL}/questionnaire-templates/${questionnaireEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error();
          const raw = await res.json();
          const updated = mapApiTemplate(raw);
          setQuestionnaireLibrary((prev) => prev.map((q) => q.id === questionnaireEditId ? updated : q));
          setQuestionnairePreviewId(questionnaireEditId);
          toast({ title: 'Questionnaire mis à jour', description: 'Les modifications ont été enregistrées.' });
        } else {
          const res = await fetch(`${API_BASE_URL}/questionnaire-templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error();
          const raw = await res.json();
          const created = mapApiTemplate(raw);
          setQuestionnaireLibrary((prev) => [created, ...prev]);
          setQuestionnairePreviewId(created.id);
          toast({ title: 'Questionnaire créé', description: 'Le questionnaire a bien été ajouté.' });
        }
      } catch {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de sauvegarder le questionnaire.' });
      } finally {
        setIsCreatingDiagnostic(false);
      }

      setIsCreateDialogOpen(false);
      setQuestionnaireEditId(null);
      setQuestionnaireEditor({
        name: '',
        description: '',
        sections: [createDefaultSection('Nouvelle section')],
      });
      setCreateForm((previous) => ({ ...previous, questionnaire: '' }));
      setActiveTab('questionnaire');
      return;
    }

    if (sectionCreationType === 'user_diagnostic' && !createForm.user_id) {
      toast({
        variant: 'destructive',
        title: 'Utilisateur requis',
        description: 'Sélectionnez un utilisateur pour créer son diagnostic.',
      });
      return;
    }

    if (sectionCreationType === 'company_diagnostic' && !createForm.company_id) {
      toast({
        variant: 'destructive',
        title: 'Entreprise requise',
        description: 'Sélectionnez une entreprise pour créer un diagnostic entreprise.',
      });
      return;
    }

    if (sectionCreationType === 'company_diagnostic' || sectionCreationType === 'user_diagnostic') {
      const requiredMetrics = [
        createForm.stress_level,
        createForm.energy_level,
        createForm.sleep_level,
        createForm.mood_level,
        createForm.work_pressure,
      ];
      if (requiredMetrics.some((metric) => metric === '')) {
        toast({
          variant: 'destructive',
          title: 'Métriques requises',
          description: 'Renseignez stress, énergie, sommeil, humeur et pression.',
        });
        return;
      }
    }

    setIsCreatingDiagnostic(true);
    try {
      const payload = {
        creation_type: sectionCreationType,
        company_id:
          sectionCreationType === 'user_diagnostic'
            ? Number(selectedUser?.entreprise_id ?? resolvedCompanyId ?? 0) || null
            : resolvedCompanyId,
        user_id: createForm.user_id ? Number(createForm.user_id) : null,
        questionnaire:
          sectionCreationType === 'company_diagnostic'
            ? `Diagnostic entreprise ${createForm.period_year}-${createForm.period_month.padStart(2, '0')}`
            : sectionCreationType === 'user_diagnostic'
            ? 'Diagnostic utilisateur'
            : createForm.questionnaire.trim(),
        stress_level: createForm.stress_level === '' ? null : Number(createForm.stress_level),
        energy_level: createForm.energy_level === '' ? null : Number(createForm.energy_level),
        work_pressure: createForm.work_pressure === '' ? null : Number(createForm.work_pressure),
        answers: {
          source: 'manual_dashboard',
          period:
            sectionCreationType === 'company_diagnostic' || sectionCreationType === 'user_diagnostic'
              ? `${createForm.period_year}-${createForm.period_month.padStart(2, '0')}`
              : null,
          avg_sleep:
            createForm.sleep_level === ''
              ? null
              : Number(createForm.sleep_level),
          avg_mood:
            createForm.mood_level === ''
              ? null
              : Number(createForm.mood_level),
        },
      };

      const response = await fetch(`${API_BASE_URL}/diagnostics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || 'Impossible de créer le diagnostic');
      }

      const created = await response.json();
      const scoreParts = [
        payload.stress_level,
        payload.energy_level,
        payload.work_pressure,
        payload.answers.avg_sleep,
        payload.answers.avg_mood,
      ].filter((value) => typeof value === 'number') as number[];
      const avgScore = scoreParts.length > 0 ? Math.round((scoreParts.reduce((sum, value) => sum + value, 0) / scoreParts.length) * 10) : 0;
      const finalCompanyId = Number(created?.answers?.company_id ?? payload.company_id ?? 0) || null;
      const finalQuestionnaire = String(created?.answers?.questionnaire ?? payload.questionnaire);
      const createdPeriod = String(
        created?.answers?.period ??
        payload.answers.period ??
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      );
      const createdCompanyName = getCompanyDisplayName(finalCompanyId);

      let category = 'Questionnaire';
      if (payload.creation_type === 'company_diagnostic') {
        category = `Entreprise: ${getCompanyDisplayName(finalCompanyId)}`;
      }
      if (payload.creation_type === 'user_diagnostic') {
        category = selectedUser ? `Utilisateur: ${getUserDisplayName(selectedUser)}` : 'Utilisateur';
      }

      setDiagnosticResults((previous) => [
        {
          id: String(created.id ?? Date.now()),
          title: `Auto-diagnostic - ${finalQuestionnaire}`,
          score: avgScore,
          maxScore: 100,
          category,
          status: getStatusFromScore(avgScore),
          date: new Date(created.completed_at ?? Date.now()).toISOString().slice(0, 10),
          recommendations: [
            'Analyse en cours par le service RH',
            'Programmer un suivi dans 15 jours',
          ],
        },
        ...previous,
      ]);

      // Keep section tables in sync with the freshly created diagnostic.
      if (payload.creation_type === 'company_diagnostic') {
        const avgSleep = Number(created?.answers?.avg_sleep ?? payload.answers.avg_sleep ?? 0);
        const avgMood = Number(created?.answers?.avg_mood ?? payload.answers.avg_mood ?? 0);

        setCompanyHealthData((previous) => [
          {
            company_name: createdCompanyName,
            month: createdPeriod,
            avg_stress: Number(payload.stress_level ?? 0),
            avg_energy: Number(payload.energy_level ?? 0),
            avg_sleep: avgSleep,
            avg_mood: avgMood,
            avg_pressure: Number(payload.work_pressure ?? 0),
          },
          ...previous,
        ]);

        const [yearPart] = createdPeriod.split('-');
        const parsedYear = Number(yearPart);
        if (!Number.isNaN(parsedYear) && parsedYear > 0) {
          setTableYear(parsedYear);
        }
        setTableMonth(0);
        setSearchTerm('');
      }

      if (payload.creation_type === 'user_diagnostic') {
        const { firstName, lastName } = getUserNameParts(selectedUser);
        const userCompanyId = Number(selectedUser?.entreprise_id ?? payload.company_id ?? finalCompanyId ?? 0) || null;
        const userCompanyName = getCompanyDisplayName(userCompanyId);

        setUsersHealthData((previous) => [
          {
            first_name: firstName,
            last_name: lastName,
            company_name: userCompanyName,
            month: createdPeriod,
            avg_stress: Number(payload.stress_level ?? 0),
            avg_energy: Number(payload.energy_level ?? 0),
            avg_sleep: Number(created?.answers?.avg_sleep ?? payload.answers.avg_sleep ?? 0),
            avg_mood: Number(created?.answers?.avg_mood ?? payload.answers.avg_mood ?? 0),
            avg_pressure: Number(payload.work_pressure ?? 0),
          },
          ...previous,
        ]);

        const [yearPart] = createdPeriod.split('-');
        const parsedYear = Number(yearPart);
        if (!Number.isNaN(parsedYear) && parsedYear > 0) {
          setTableYear(parsedYear);
        }
        setTableMonth(0);
        setSearchTerm('');
      }

      toast({
        title: 'Diagnostic créé',
        description: 'Le nouveau diagnostic a été enregistré avec succès.',
      });

      setIsCreateDialogOpen(false);
      setCreateForm({
        company_id: '',
        user_id: '',
        questionnaire: '',
        period_month: String(new Date().getMonth() + 1),
        period_year: String(new Date().getFullYear()),
        stress_level: '',
        energy_level: '',
        sleep_level: '',
        mood_level: '',
        work_pressure: '',
      });
      setActiveTab('historique');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur inattendue.',
      });
    } finally {
      setIsCreatingDiagnostic(false);
    }
  };

  if (initialLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Santé & Diagnostic</h1>
            <p className="text-gray-600">Suivez votre bien-être et recevez des recommandations personnalisées</p>
          </div>
          <div className="flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau diagnostic
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Créer un diagnostic pour...</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab('entreprises');
                    setTimeout(() => setIsCreateDialogOpen(true), 50);
                  }}
                >
                  <Building2 className="w-4 h-4 mr-2 text-blue-500" />
                  Entreprise
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab('users');
                    setTimeout(() => setIsCreateDialogOpen(true), 50);
                  }}
                >
                  <Users className="w-4 h-4 mr-2 text-green-500" />
                  Utilisateur
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setActiveTab('questionnaire');
                    setTimeout(() => openQuestionnaireCreateDialog(), 50);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2 text-purple-500" />
                  Questionnaire
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setQuestionnaireEditId(null);
            }
          }}
        >
          <DialogContent className={sectionCreationType === 'questionnaire' ? 'sm:max-w-4xl max-h-[90vh] overflow-y-auto' : 'sm:max-w-lg'}>
            <DialogHeader>
              <DialogTitle>
                {sectionCreationType === 'company_diagnostic'
                  ? 'Nouveau diagnostic entreprise'
                  : sectionCreationType === 'user_diagnostic'
                  ? 'Nouveau diagnostic utilisateur'
                  : questionnaireEditId
                  ? 'Modifier le questionnaire'
                  : 'Nouveau questionnaire'}
              </DialogTitle>
              <DialogDescription>
                {sectionCreationType === 'company_diagnostic'
                  ? 'Renseignez uniquement les informations de la section Entreprises.'
                  : sectionCreationType === 'user_diagnostic'
                  ? 'Renseignez uniquement les informations de la section Utilisateurs.'
                  : 'Créez un questionnaire complet avec sections et questions.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              {sectionCreationType !== 'company_diagnostic' &&
                sectionCreationType === 'questionnaire' && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="diagnostic-questionnaire">Nom du questionnaire</Label>
                      <Input
                        id="diagnostic-questionnaire"
                        value={questionnaireEditor.name}
                        placeholder="Ex: Retour de congés Q2"
                        onChange={(e) =>
                          setQuestionnaireEditor((previous) => ({
                            ...previous,
                            name: e.target.value,
                          }))
                        }
                        list="diagnostic-questionnaire-options"
                      />
                      <datalist id="diagnostic-questionnaire-options">
                        {questionnaireOptions.map((questionnaire) => (
                          <option key={questionnaire} value={questionnaire} />
                        ))}
                      </datalist>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="diagnostic-questionnaire-description">Description</Label>
                      <Input
                        id="diagnostic-questionnaire-description"
                        value={questionnaireEditor.description}
                        placeholder="Contexte, objectif et population cible"
                        onChange={(e) =>
                          setQuestionnaireEditor((previous) => ({
                            ...previous,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Sections & Questions</h4>
                      <Button type="button" size="sm" variant="outline" onClick={addQuestionnaireSection}>
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter section
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {questionnaireEditor.sections.map((section, sectionIndex) => (
                        <Card key={section.id} className="p-4 space-y-3 border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Input
                              value={section.title}
                              placeholder={`Section ${sectionIndex + 1}`}
                              onChange={(e) => updateQuestionnaireSection(section.id, { title: e.target.value })}
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="outline"
                              onClick={() => removeQuestionnaireSection(section.id)}
                              disabled={questionnaireEditor.sections.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {section.questions.map((question, questionIndex) => (
                              <div key={question.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border rounded-md p-2 bg-gray-50">
                                <div className="md:col-span-5">
                                  <Input
                                    value={question.label}
                                    placeholder={`Question ${questionIndex + 1}`}
                                    onChange={(e) => updateQuestionInSection(section.id, question.id, { label: e.target.value })}
                                  />
                                </div>

                                <div className="md:col-span-2">
                                  <select
                                    value={question.type}
                                    onChange={(e) => {
                                      const nextType = e.target.value as QuestionnaireQuestionType;
                                      updateQuestionInSection(section.id, question.id, {
                                        type: nextType,
                                        maxScore: nextType === 'text' ? 0 : question.maxScore || 10,
                                        options: nextType === 'single_choice' ? (question.options.length ? question.options : ['Option 1', 'Option 2']) : [],
                                      });
                                    }}
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  >
                                    <option value="rating">Note</option>
                                    <option value="text">Texte</option>
                                    <option value="single_choice">Choix unique</option>
                                  </select>
                                </div>

                                <div className="md:col-span-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={question.maxScore}
                                    disabled={question.type === 'text'}
                                    onChange={(e) =>
                                      updateQuestionInSection(section.id, question.id, {
                                        maxScore: Number(e.target.value || 0),
                                      })
                                    }
                                  />
                                </div>

                                <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-600">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) =>
                                      updateQuestionInSection(section.id, question.id, { required: e.target.checked })
                                    }
                                  />
                                  Requise
                                </label>

                                <div className="md:col-span-1 flex justify-end">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={() => removeQuestionFromSection(section.id, question.id)}
                                    disabled={section.questions.length <= 1}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                {question.type === 'single_choice' && (
                                  <div className="md:col-span-12">
                                    <Input
                                      value={question.options.join(', ')}
                                      placeholder="Options séparées par des virgules"
                                      onChange={(e) =>
                                        updateQuestionInSection(section.id, question.id, {
                                          options: e.target.value
                                            .split(',')
                                            .map((option) => option.trim())
                                            .filter(Boolean),
                                        })
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            ))}

                            <Button type="button" size="sm" variant="outline" onClick={() => addQuestionToSection(section.id)}>
                              <Plus className="w-4 h-4 mr-1" />
                              Ajouter question
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {sectionCreationType === 'company_diagnostic' && (
                <div className="grid gap-2">
                  <Label htmlFor="diagnostic-company">Entreprise</Label>
                  <select
                    id="diagnostic-company"
                    value={createForm.company_id}
                    onChange={(e) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        company_id: e.target.value,
                        user_id: '',
                      }))
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sectionCreationType === 'user_diagnostic' && (
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="diagnostic-user-company">Nom de l'entreprise</Label>
                    <select
                      id="diagnostic-user-company"
                      value={createForm.company_id}
                      onChange={(e) =>
                        setCreateForm((previous) => ({
                          ...previous,
                          company_id: e.target.value,
                          user_id: '',
                        }))
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Pas d'entreprise (Tous les utilisateurs)</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="diagnostic-user">Utilisateur</Label>
                    <select
                      id="diagnostic-user"
                      value={createForm.user_id}
                      onChange={(e) => {
                        const nextUserId = e.target.value;
                        const chosenUser = users.find((user) => user.id === Number(nextUserId));
                        setCreateForm((previous) => ({
                          ...previous,
                          user_id: nextUserId,
                          company_id: previous.company_id || String(chosenUser?.entreprise_id ?? ''),
                        }));
                      }}
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Sélectionner un utilisateur</option>
                      {selectableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {getUserDisplayName(user)}
                        </option>
                      ))}
                    </select>
                    {selectedUser?.entreprise_id ? (
                      <p className="text-xs text-gray-500">
                        Entreprise associée: {getCompanyDisplayName(Number(selectedUser.entreprise_id))}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}

              {sectionCreationType === 'user_diagnostic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="diagnostic-user-period-month">Mois</Label>
                    <select
                      id="diagnostic-user-period-month"
                      value={createForm.period_month}
                      onChange={(e) =>
                        setCreateForm((previous) => ({
                          ...previous,
                          period_month: e.target.value,
                        }))
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="diagnostic-user-period-year">Année</Label>
                    <select
                      id="diagnostic-user-period-year"
                      value={createForm.period_year}
                      onChange={(e) =>
                        setCreateForm((previous) => ({
                          ...previous,
                          period_year: e.target.value,
                        }))
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>
              )}

              {sectionCreationType === 'company_diagnostic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="diagnostic-period-month">Mois</Label>
                    <select
                      id="diagnostic-period-month"
                      value={createForm.period_month}
                      onChange={(e) =>
                        setCreateForm((previous) => ({
                          ...previous,
                          period_month: e.target.value,
                        }))
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="diagnostic-period-year">Année</Label>
                    <select
                      id="diagnostic-period-year"
                      value={createForm.period_year}
                      onChange={(e) =>
                        setCreateForm((previous) => ({
                          ...previous,
                          period_year: e.target.value,
                        }))
                      }
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>
                </div>
              )}

              {sectionCreationType !== 'questionnaire' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="diagnostic-stress">Stress (0-10)</Label>
                  <Input
                    id="diagnostic-stress"
                    type="number"
                    min={0}
                    max={10}
                    value={createForm.stress_level}
                    onChange={(e) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        stress_level: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="diagnostic-energy">Énergie (0-10)</Label>
                  <Input
                    id="diagnostic-energy"
                    type="number"
                    min={0}
                    max={10}
                    value={createForm.energy_level}
                    onChange={(e) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        energy_level: e.target.value,
                      }))
                    }
                  />
                </div>

                {(sectionCreationType === 'company_diagnostic' || sectionCreationType === 'user_diagnostic') && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="diagnostic-sleep">Sommeil (0-10)</Label>
                      <Input
                        id="diagnostic-sleep"
                        type="number"
                        min={0}
                        max={10}
                        value={createForm.sleep_level}
                        onChange={(e) =>
                          setCreateForm((previous) => ({
                            ...previous,
                            sleep_level: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="diagnostic-mood">Humeur (0-10)</Label>
                      <Input
                        id="diagnostic-mood"
                        type="number"
                        min={0}
                        max={10}
                        value={createForm.mood_level}
                        onChange={(e) =>
                          setCreateForm((previous) => ({
                            ...previous,
                            mood_level: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="diagnostic-pressure">Pression (0-10)</Label>
                  <Input
                    id="diagnostic-pressure"
                    type="number"
                    min={0}
                    max={10}
                    value={createForm.work_pressure}
                    onChange={(e) =>
                      setCreateForm((previous) => ({
                        ...previous,
                        work_pressure: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreatingDiagnostic}>
                Annuler
              </Button>
              <Button onClick={handleCreateDiagnostic} disabled={isCreatingDiagnostic}>
                {isCreatingDiagnostic ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  sectionCreationType === 'questionnaire'
                    ? questionnaireEditId
                      ? 'Mettre à jour le questionnaire'
                      : 'Créer le questionnaire'
                    : 'Créer le diagnostic'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isQuestionnairePreviewOpen} onOpenChange={setIsQuestionnairePreviewOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Aperçu questionnaire: {selectedQuestionnaire?.name || 'Questionnaire'}
              </DialogTitle>
              <DialogDescription>
                Visualisation de l\'expérience côté utilisateur final.
              </DialogDescription>
            </DialogHeader>

            {selectedQuestionnaire ? (
              <div className="space-y-4">
                {selectedQuestionnaire.sections.map((section, sectionIndex) => (
                  <Card key={section.id} className="p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {sectionIndex + 1}. {section.title}
                      </h4>
                      <Badge className="bg-blue-100 text-blue-700">
                        {section.questions.length} questions
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {section.questions.map((question, questionIndex) => (
                        <div key={question.id} className="rounded-md border border-gray-200 p-3 bg-white">
                          <p className="text-sm font-medium text-gray-900">
                            {sectionIndex + 1}.{questionIndex + 1} {question.label}
                            {question.required ? ' *' : ''}
                          </p>

                          {question.type === 'rating' && (
                            <div className="mt-2 grid grid-cols-5 md:grid-cols-10 gap-1">
                              {Array.from({ length: 10 }).map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="h-8 rounded border border-gray-200 text-xs text-gray-700"
                                >
                                  {idx + 1}
                                </button>
                              ))}
                            </div>
                          )}

                          {question.type === 'text' && (
                            <textarea
                              className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                              placeholder="Votre réponse..."
                              rows={3}
                              readOnly
                            />
                          )}

                          {question.type === 'single_choice' && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, optionIndex) => (
                                <label key={`${question.id}-opt-${optionIndex}`} className="flex items-center gap-2 text-sm text-gray-700">
                                  <input type="radio" name={question.id} disabled />
                                  {option}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucun questionnaire sélectionné.</p>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsQuestionnairePreviewOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="entreprises" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Entreprises
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Questionnaire
            </TabsTrigger>
            <TabsTrigger value="historique" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="recommandations" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Recommandations
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* Filter Global */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mr-1">Global :</span>
                <select 
                  value={globalMonth} 
                  onChange={(e) => setGlobalMonth(Number(e.target.value))} 
                  className="text-sm font-medium text-gray-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer"
                >
                  {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <div className="w-px h-4 bg-gray-200 mx-2"></div>
                <select 
                  value={globalYear} 
                  onChange={(e) => setGlobalYear(Number(e.target.value))} 
                  className="text-sm font-medium text-gray-700 border-none bg-transparent p-0 focus:ring-0 cursor-pointer"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progression générale */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Progression des métriques
                </h3>
                <div className="space-y-4">
                  <ProgressMetric 
                    label="Score Global" 
                    value={statsLoading ? 0 : globalScore} 
                    max={100}
                    loading={statsLoading}
                    
                  />
                  <ProgressMetric 
                    label="Niveau d'énergie" 
                    value={statsLoading ? 0 : Number(stats.moyen_energie).toFixed(1)} 
                    max={10}
                    loading={statsLoading}
                  />
                  <ProgressMetric 
                    label="Niveau de stress" 
                    value={statsLoading ? 0 : Number(stats.moyen_stress).toFixed(1)} 
                    max={10}
                    loading={statsLoading}
                  />
                  <ProgressMetric 
                    label="Qualité du sommeil" 
                    value={statsLoading ? 0 : Number(stats.moyen_sommeil).toFixed(1)} 
                    max={10}
                    loading={statsLoading}
                  />
                  <ProgressMetric 
                    label="Satisfaction travail" 
                    value={statsLoading ? 0 : Number(stats.moyen_mood).toFixed(1)} 
                    max={10}
                    loading={statsLoading}
                  />
                  <ProgressMetric 
                    label="Pression travail" 
                    value={statsLoading ? 0 : Number(stats.moyen_pression).toFixed(1)} 
                    max={10}
                    loading={statsLoading}
                  />
                </div>
              </Card>

              {/* Dernier diagnostic */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Dernier diagnostic
                </h3>
                <div className="space-y-3">
                  {diagnosticResults.length === 0 ? (
                    <div className="text-sm text-gray-600">Aucun diagnostic disponible.</div>
                  ) : (
                    (() => {
                      const first = diagnosticResults[0];
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{first?.title ?? 'Titre indisponible'}</h4>
                            <Badge className={getStatusColor(first?.status ?? '')}>
                              {first?.status ?? '—'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{first?.date ?? '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Score:</span>
                            <div className="flex-1">
                              <Progress
                                value={first && first.maxScore ? (first.score / first.maxScore) * 100 : 0}
                                className="h-2"
                              />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(first?.score ?? 0, first?.maxScore ?? 100)}`}>
                              {first?.score ?? 0}/{first?.maxScore ?? 100}
                            </span>
                          </div>
                          <div className="pt-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Recommandations principales:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {(first?.recommendations ?? []).slice(0, 2).map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <Target className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Entreprises */}
          <TabsContent value="entreprises" className="space-y-4">
            {/* Barre de filtre */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher une entreprise..."
                    className="w-full pl-11 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                    <select 
                      value={tableMonth} 
                      onChange={(e) => setTableMonth(Number(e.target.value))} 
                      className="text-sm font-medium text-gray-700 border-none bg-transparent focus:ring-0 cursor-pointer"
                    >
                      <option value={0}>Tous les mois</option>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <div className="w-px h-4 bg-gray-200 mx-2"></div>
                    <select 
                      value={tableYear} 
                      onChange={(e) => setTableYear(Number(e.target.value))} 
                      className="text-sm font-medium text-gray-700 border-none bg-transparent focus:ring-0 cursor-pointer"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tableau des entreprises */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900">Entreprise</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900">Période</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Stress</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Énergie</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Sommeil</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Humeur</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Pression</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCompanies.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{item.company_name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{item.month}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_stress).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_energy).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_sleep).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_mood).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_pressure).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deleteCompanyHealthRow(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Utilisateurs */}
          <TabsContent value="users" className="space-y-4">
            {/* Barre de filtre */}
            <Card className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un utilisateur..."
                    className="w-full pl-11 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                    <select 
                      value={tableMonth} 
                      onChange={(e) => setTableMonth(Number(e.target.value))} 
                      className="text-sm font-medium text-gray-700 border-none bg-transparent focus:ring-0 cursor-pointer"
                    >
                      <option value={0}>Tous les mois</option>
                      {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <div className="w-px h-4 bg-gray-200 mx-2"></div>
                    <select 
                      value={tableYear} 
                      onChange={(e) => setTableYear(Number(e.target.value))} 
                      className="text-sm font-medium text-gray-700 border-none bg-transparent focus:ring-0 cursor-pointer"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tableau des utilisateurs */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900">Utilisateur</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900">Entreprise</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900">Période</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Stress</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Énergie</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Sommeil</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Humeur</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Pression</th>
                      <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">
                            {item.display_name || `${item.first_name ?? ''} ${item.last_name ?? ''}`.trim() || `Utilisateur #${item.user_id ?? 'N/A'}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{item.company_name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{item.month}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_stress).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_energy).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_sleep).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_mood).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-lg text-gray-900">
                            {Number(item.avg_pressure).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => deleteUserHealthRow(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Questionnaire en cours */}
          <TabsContent value="questionnaire" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-4 lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Bibliothèque
                  </h3>
                  <Button size="sm" onClick={openQuestionnaireCreateDialog}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nouveau
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showArchivedQuestionnaires}
                    onChange={(e) => setShowArchivedQuestionnaires(e.target.checked)}
                  />
                  Voir les archives
                </label>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {(showArchivedQuestionnaires ? archivedQuestionnaires : activeQuestionnaires).map((questionnaire) => {
                    const sectionCount = questionnaire.sections.length;
                    const questionCount = questionnaire.sections.reduce((sum, section) => sum + section.questions.length, 0);
                    const selected = selectedQuestionnaire?.id === questionnaire.id;

                    return (
                      <button
                        key={questionnaire.id}
                        type="button"
                        className={`w-full text-left p-3 rounded-md border transition-colors ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                        onClick={() => setQuestionnairePreviewId(questionnaire.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-gray-900">{questionnaire.name}</p>
                          <Badge className={questionnaire.archived ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}>
                            {questionnaire.archived ? 'Archivé' : 'Actif'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{sectionCount} sections • {questionCount} questions</p>
                        <p className="text-xs text-gray-500 mt-1">Cree par {questionnaire.createdByName || connectedAdmin.name}</p>
                      </button>
                    );
                  })}

                  {(showArchivedQuestionnaires ? archivedQuestionnaires : activeQuestionnaires).length === 0 && (
                    <p className="text-sm text-gray-500">Aucun questionnaire dans cette vue.</p>
                  )}
                </div>
              </Card>

              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Questionnaires actifs</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{activeQuestionnaires.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Questionnaires archivés</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{archivedQuestionnaires.length}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Questions totales</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{totalQuestionCount}</p>
                  </Card>
                </div>

                <Card className="p-6">
                  {selectedQuestionnaire ? (
                    <>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedQuestionnaire.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedQuestionnaire.description || 'Aucune description'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Créé le {selectedQuestionnaire.createdAt} • Mis à jour le {selectedQuestionnaire.updatedAt}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setQuestionnairePreviewId(selectedQuestionnaire.id);
                              setIsQuestionnairePreviewOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => downloadQuestionnairePdf(selectedQuestionnaire)}>
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger PDF
                          </Button>
                          {!selectedQuestionnaire.archived && (
                            <Button size="sm" variant="outline" onClick={() => openQuestionnaireEditDialog(selectedQuestionnaire)}>
                              <Pencil className="w-4 h-4 mr-1" />
                              Modifier
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => duplicateQuestionnaire(selectedQuestionnaire)}>
                            <Copy className="w-4 h-4 mr-1" />
                            Dupliquer
                          </Button>
                          {selectedQuestionnaire.archived ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleArchiveQuestionnaire(selectedQuestionnaire.id, false)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Restaurer
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleArchiveQuestionnaire(selectedQuestionnaire.id, true)}
                            >
                              <Archive className="w-4 h-4 mr-1" />
                              Archiver
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteQuestionnaire(selectedQuestionnaire.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedQuestionnaire.sections.map((section, index) => {
                          const sectionMaxScore = section.questions.reduce((sum, question) => sum + question.maxScore, 0);
                          return (
                            <Card key={section.id} className="p-4 border border-gray-200">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{index + 1}. {section.title}</h4>
                                <Badge className="bg-blue-100 text-blue-700">
                                  {section.questions.length} questions • {sectionMaxScore} pts
                                </Badge>
                              </div>
                              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                                {section.questions.map((question) => (
                                  <li key={question.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <span>{question.label}</span>
                                    <span className="text-xs text-gray-500">
                                      {question.type === 'rating' ? 'Note' : question.type === 'text' ? 'Texte' : 'Choix'}
                                      {question.type !== 'text' ? ` • ${question.maxScore} pts` : ''}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Sélectionnez un questionnaire pour voir son aperçu.</p>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Historique */}
          <TabsContent value="historique" className="space-y-6">
            <div className="space-y-4">
              {diagnosticResults.map((result) => (
                <Card key={result.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-gray-600">{result.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">{result.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Score obtenu</span>
                        <span className={getScoreColor(result.score, result.maxScore)}>
                          {result.score}/{result.maxScore}
                        </span>
                      </div>
                      <Progress 
                        value={(result.score / result.maxScore) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Recommandations:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {result.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Target className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Recommandations */}
          <TabsContent value="recommandations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Points forts à maintenir
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Excellent équilibre vie pro/perso</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Relations harmonieuses avec l'équipe</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Motivation et engagement élevés</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Axes d'amélioration
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Améliorer la qualité du sommeil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gérer le stress en fin de journée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Planifier des pauses plus régulières</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 col-span-full">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Plan d'action personnalisé
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Cette semaine</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Routine de coucher à 22h</li>
                      <li>• 5 min de méditation quotidienne</li>
                      <li>• Pauses de 10 min toutes les 2h</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Ce mois</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Rejoindre le groupe sport entreprise</li>
                      <li>• Organiser 2 pauses café équipe</li>
                      <li>• Évaluation mi-parcours</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Long terme</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Formation gestion du stress</li>
                      <li>• Aménagement poste de travail</li>
                      <li>• Bilan trimestriel complet</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Composant ProgressMetric
const ProgressMetric = ({ 
  label, 
  value, 
  max, 
  loading, 
  trend 
}: { 
  label: string; 
  value: number | string; 
  max: number; 
  loading: boolean; 
  trend?: string;
}) => {
  const percentage = (Number(value) / max) * 100;
  
  const getScoreColor = (val: number, maximum: number) => {
    const pct = (val / maximum) * 100;
    if (pct >= 70) return 'text-green-600';
    if (pct >= 40) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${loading ? 'text-gray-400' : getScoreColor(Number(value), max)}`}>
            {loading ? '...' : `${value}${max === 100 ? '%' : '/10'}`}
          </span>
          {trend && !loading && (
            <span className="text-xs text-green-600 font-medium">{trend}</span>
          )}
        </div>
      </div>
      <Progress 
        value={loading ? 0 : percentage} 
        className="h-2"
      />
    </div>
  );
};

export default SanteDiagnosticDashboard;