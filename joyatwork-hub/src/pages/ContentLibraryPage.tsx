import { useEffect, useState } from "react";
import { Plus, Search, Filter, Grid, List, BarChart3, Edit, Play, Trash2, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentBuilder, ContentUploadFiles } from "@/components/content/ContentBuilder";
import { ContentType, MediaContent } from "@/types/content";
import api, { API_BASE_URL } from "@/lib/api";

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data;
  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    const message = (responseData as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

interface PreviewAsset {
  id: string;
  label: string;
  url: string;
  kind: "image" | "audio" | "video" | "pdf" | "file";
}

interface ApiContent {
  id: number;
  title: string;
  description?: string | null;
  type: ContentType;
  format?: string | null;
  duration?: number | null;
  thematic?: string[] | null;
  tags?: string[] | null;
  status?: "published" | "draft" | "archived" | "scheduled" | null;
  language?: string | null;
  visibility?: "all" | "practitioners" | "managers" | "hr" | "specific_companies" | "private" | null;
  intensity?: "léger" | "modéré" | "intense" | null;
  level?: "novice" | "habitué" | "expert" | null;
  author?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  thumbnail?: string | null;
  file_url?: string | null;
  annex_files?: Array<{ name: string; url: string; type: string }> | null;
  companies?: string[] | null;
  practitioner_only?: boolean | null;
  views?: number | null;
  completion_rate?: number | null;
  average_watch_time?: number | null;
  rating?: number | null;
  feedback?: Array<{ userId: string; rating: number; comment?: string; date: string }> | null;
  collections?: string[] | null;
  is_pinned?: boolean | null;
  is_hot_content?: boolean | null;
  has_quiz?: boolean | null;
  practitioner_guide?: string | null;
  customization?: {
    visualTheme?: string;
    audioAmbient?: string;
  } | null;
  keywords?: string[] | null;
  search_boost?: number | null;
}

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return window.location.origin;
  }
})();

const resolveAssetUrl = (url?: string | null): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("blob:") || /^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, API_ORIGIN).toString();
};

const stripBlobUrl = (url?: string | null): string | null => {
  if (!url || url.startsWith("blob:")) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.origin === API_ORIGIN) {
        return `${parsedUrl.pathname}${parsedUrl.search}`;
      }
    } catch {
      return url;
    }
  }

  return url;
};

const normalizeAnnexFilesForApi = (
  annexFiles?: Array<{ name: string; url: string; type: string }>
) => {
  if (!annexFiles || annexFiles.length === 0) {
    return [];
  }

  return annexFiles
    .map((file) => {
      const normalizedUrl = stripBlobUrl(file.url);
      if (!normalizedUrl) {
        return null;
      }

      return {
        name: file.name,
        url: normalizedUrl,
        type: file.type || "file",
      };
    })
    .filter((file): file is { name: string; url: string; type: string } => Boolean(file));
};

const parseApiDate = (value?: string | null): Date | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const mapApiContentToMediaContent = (item: ApiContent): MediaContent => ({
  id: Number(item.id),
  title: item.title,
  description: item.description || "",
  type: item.type,
  format: item.format || "file",
  duration: item.duration || 0,
  thematic: item.thematic || [],
  tags: item.tags || [],
  status: item.status || "draft",
  language: item.language || "fr",
  visibility: item.visibility || "all",
  intensity: item.intensity || "léger",
  level: item.level || undefined,
  author: item.author || "Administrateur",
  createdAt: parseApiDate(item.created_at) || new Date(),
  updatedAt: parseApiDate(item.updated_at),
  publishedAt: parseApiDate(item.published_at),
  scheduledAt: parseApiDate(item.scheduled_at),
  thumbnail: resolveAssetUrl(item.thumbnail),
  fileUrl: resolveAssetUrl(item.file_url),
  annexFiles: (item.annex_files || []).map((annex) => ({
    ...annex,
    url: resolveAssetUrl(annex.url) || annex.url,
  })),
  companies: item.companies || [],
  practitionerOnly: item.practitioner_only || false,
  views: item.views || 0,
  completionRate: item.completion_rate || 0,
  averageWatchTime: item.average_watch_time || undefined,
  rating: item.rating || undefined,
  feedback: item.feedback?.map((f) => ({
    ...f,
    date: parseApiDate(f.date) || new Date(),
  })),
  collections: item.collections || [],
  isPinned: item.is_pinned || false,
  isHotContent: item.is_hot_content || false,
  hasQuiz: item.has_quiz || false,
  practitionerGuide: resolveAssetUrl(item.practitioner_guide),
  customization: item.customization || undefined,
  keywords: item.keywords || [],
  searchBoost: item.search_boost || undefined,
});

const mapMediaContentToApiPayload = (
  contentData: Partial<MediaContent>,
  author: string
) => ({
  title: contentData.title,
  description: contentData.description || "",
  type: contentData.type,
  format: contentData.format || "file",
  duration: contentData.duration || 0,
  thematic: contentData.thematic || [],
  tags: contentData.tags || [],
  status: contentData.status || "draft",
  language: contentData.language || "fr",
  visibility: contentData.visibility || "all",
  intensity: contentData.intensity || "léger",
  level: contentData.level || null,
  author,
  published_at: contentData.publishedAt ? contentData.publishedAt.toISOString() : null,
  scheduled_at: contentData.scheduledAt ? contentData.scheduledAt.toISOString() : null,
  thumbnail: stripBlobUrl(contentData.thumbnail),
  file_url: stripBlobUrl(contentData.fileUrl),
  annex_files: normalizeAnnexFilesForApi(contentData.annexFiles),
  companies: contentData.companies || [],
  practitioner_only: contentData.practitionerOnly || false,
  views: contentData.views || 0,
  completion_rate: contentData.completionRate || 0,
  average_watch_time: contentData.averageWatchTime || null,
  rating: contentData.rating || null,
  feedback: contentData.feedback || [],
  collections: contentData.collections || [],
  is_pinned: contentData.isPinned || false,
  is_hot_content: contentData.isHotContent || false,
  has_quiz: contentData.hasQuiz || false,
  practitioner_guide: stripBlobUrl(contentData.practitionerGuide),
  customization: contentData.customization || null,
  keywords: contentData.keywords || [],
  search_boost: contentData.searchBoost || null,
});

const buildContentFormData = (
  payload: ReturnType<typeof mapMediaContentToApiPayload>,
  files: ContentUploadFiles
) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  if (files.mainFile) {
    formData.append("main_file", files.mainFile);
  }

  if (files.thumbnailFile) {
    formData.append("thumbnail_file", files.thumbnailFile);
  }

  if (files.practitionerGuideFile) {
    formData.append("practitioner_guide_file", files.practitionerGuideFile);
  }

  (files.annexFiles || []).forEach((file) => {
    formData.append("annex_files_upload[]", file);
  });

  return formData;
};

const mockContents: MediaContent[] = [
  {
    id: 1,
    title: "Méditation énergisante 5 minutes",
    description: "Commencez votre journée avec cette méditation courte et dynamisante",
    type: "meditation",
    format: "audio",
    duration: 5,
    thematic: ["énergie", "matin"],
    tags: ["#court", "#autonome", "#routineMatinale"],
    status: "published",
    language: "fr",
    visibility: "all",
    intensity: "léger",
    author: "Admin JoyatWork",
    createdAt: new Date("2024-01-15"),
    publishedAt: new Date("2024-01-16"),
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    fileUrl: "/audio/meditation-energie-5min.mp3",
    views: 1240,
    completionRate: 89,
    rating: 4.6,
    companies: [],
    isPinned: true,
    isHotContent: true
  },
  {
    id: 2,
    title: "Gérer le stress au travail",
    description: "Techniques pratiques pour réduire le stress professionnel",
    type: "video",
    format: "video",
    duration: 12,
    thematic: ["stress", "travail"],
    tags: ["#gestionStress", "#techniques", "#pratique"],
    status: "published",
    language: "fr",
    visibility: "all",
    intensity: "modéré",
    author: "Dr. Marie Dubois",
    createdAt: new Date("2024-01-10"),
    publishedAt: new Date("2024-01-12"),
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    fileUrl: "/videos/gestion-stress.mp4",
    views: 890,
    completionRate: 76,
    rating: 4.4,
    companies: ["TechCorp", "StartupXYZ"],
    isPinned: false,
    isHotContent: false
  },
  {
    id: 3,
    title: "Guide du sommeil réparateur",
    description: "Techniques et conseils pour améliorer la qualité de votre sommeil",
    type: "article",
    format: "pdf",
    duration: 0,
    thematic: ["sommeil", "bien-être"],
    tags: ["#sommeil", "#guide", "#conseils"],
    status: "draft",
    language: "fr",
    visibility: "managers",
    intensity: "léger",
    author: "Admin JoyatWork",
    createdAt: new Date("2024-01-20"),
    thumbnail: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55",
    fileUrl: "/pdf/guide-sommeil.pdf",
    views: 0,
    completionRate: 0,
    companies: [],
    isPinned: false,
    isHotContent: false
  }
];

const ContentLibraryPage = () => {
  const getCurrentUserFullName = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) {
        return "Administrateur";
      }

      const parsedUser = JSON.parse(rawUser) as {
        first_name?: string;
        last_name?: string;
        name?: string;
      };

      const firstName = parsedUser.first_name?.trim() ?? "";
      const lastName = parsedUser.last_name?.trim() ?? "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ");

      return fullName || parsedUser.name?.trim() || "Administrateur";
    } catch {
      return "Administrateur";
    }
  };

  const [contents, setContents] = useState<MediaContent[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingContent, setEditingContent] = useState<MediaContent | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterThematic, setFilterThematic] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [contentToDelete, setContentToDelete] = useState<MediaContent | null>(null);
  const [previewContent, setPreviewContent] = useState<MediaContent | null>(null);
  const [selectedPreviewAssetId, setSelectedPreviewAssetId] = useState<string>("");
  const [isLoadingContents, setIsLoadingContents] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchContents = async () => {
      setIsLoadingContents(true);
      try {
        const response = await api.get<ApiContent[]>("/contents");
        if (!isMounted) {
          return;
        }

        setContents(response.data.map(mapApiContentToMediaContent));
      } catch (error) {
        console.error("Impossible de charger les contenus depuis la BDD:", error);
        if (!isMounted) {
          return;
        }

        // Fallback local pour conserver l'interface utilisable si l'API n'est pas encore migrée.
        setContents(mockContents);
        const msg = getApiErrorMessage(error, "Impossible de charger les contenus.");
        window.alert(msg);
      } finally {
        if (isMounted) {
          setIsLoadingContents(false);
        }
      }
    };

    fetchContents();

    return () => {
      isMounted = false;
    };
  }, []);

  const inferAssetKind = (url: string, fallbackFormat?: string): PreviewAsset["kind"] => {
    const source = (url || fallbackFormat || "").toLowerCase();
    if (source.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp|avif)$/) || source.includes("image")) {
      return "image";
    }
    if (source.match(/\.(mp4|webm|mov|mkv)$/) || source.includes("video")) {
      return "video";
    }
    if (source.match(/\.(mp3|wav|ogg|m4a|aac)$/) || source.includes("audio")) {
      return "audio";
    }
    if (source.match(/\.pdf$/)) {
      return "pdf";
    }
    return "file";
  };

  const buildPreviewAssets = (content: MediaContent): PreviewAsset[] => {
    const assets: PreviewAsset[] = [];

    if (content.fileUrl) {
      assets.push({
        id: "main",
        label: "Fichier principal",
        url: content.fileUrl,
        kind: inferAssetKind(content.fileUrl, content.format),
      });
    }

    if (content.thumbnail) {
      assets.push({
        id: "thumbnail",
        label: "Image de couverture",
        url: content.thumbnail,
        kind: "image",
      });
    }

    if (content.practitionerGuide) {
      assets.push({
        id: "guide",
        label: "Guide praticien",
        url: content.practitionerGuide,
        kind: inferAssetKind(content.practitionerGuide),
      });
    }

    (content.annexFiles || []).forEach((file, index) => {
      assets.push({
        id: `annex-${index}`,
        label: file.name || `Fichier annexe ${index + 1}`,
        url: file.url,
        kind: inferAssetKind(file.url, file.type),
      });
    });

    return assets;
  };

  const normalizeAssetUrl = (url: string) =>
    url.startsWith("blob:") ? url : new URL(url, API_ORIGIN).toString();

  const openAssetInNewTab = (asset?: PreviewAsset) => {
    if (!asset) {
      return;
    }

    window.open(normalizeAssetUrl(asset.url), "_blank", "noopener,noreferrer");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case "meditation": return "🧘";
      case "video": return "🎥";
      case "audio": return "🎧";
      case "article": return "📄";
      case "challenge": return "🎯";
      case "tool": return "🛠️";
      default: return "📁";
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || content.type === filterType;
    const matchesThematic = filterThematic === "all" || content.thematic.includes(filterThematic);
    const matchesStatus = filterStatus === "all" || content.status === filterStatus;
    return matchesSearch && matchesType && matchesThematic && matchesStatus;
  }).sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const aDate = (a.updatedAt || a.createdAt).getTime();
    const bDate = (b.updatedAt || b.createdAt).getTime();
    return bDate - aDate;
  });

  const handleEditContent = (content: MediaContent) => {
    setEditingContent(content);
    setShowBuilder(true);
  };

  const handleDeleteContent = (content: MediaContent) => {
    setContentToDelete(content);
  };

  const confirmDeleteContent = async () => {
    if (!contentToDelete) {
      return;
    }

    try {
      await api.delete(`/contents/${contentToDelete.id}`);
      setContents((prev) => prev.filter((item) => item.id !== contentToDelete.id));
      setContentToDelete(null);
    } catch (error) {
      console.error("Suppression impossible en base de données:", error);
      const msg = getApiErrorMessage(error, "La suppression a échoué côté serveur.");
      window.alert(msg);
    }
  };

  const handlePreviewContent = (content: MediaContent) => {
    const assets = buildPreviewAssets(content);
    if (assets.length === 0) {
      return;
    }

    setPreviewContent(content);
    setSelectedPreviewAssetId(assets[0].id);
  };

  const handleSaveContent = async (contentData: Partial<MediaContent>, uploadFiles: ContentUploadFiles) => {
    const currentUserFullName = getCurrentUserFullName();
    const payload = mapMediaContentToApiPayload(contentData, currentUserFullName);
    const formData = buildContentFormData(payload, uploadFiles);

    if (!payload.title || !payload.type) {
      window.alert("Le titre et le type de contenu sont obligatoires.");
      return;
    }

    try {
      if (editingContent) {
        formData.append("_method", "PUT");
        const response = await api.post<ApiContent>(`/contents/${editingContent.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const persistedContent = mapApiContentToMediaContent(response.data);
        setContents((prev) => prev.map((c) => (c.id === editingContent.id ? persistedContent : c)));
      } else {
        const response = await api.post<ApiContent>("/contents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const persistedContent = mapApiContentToMediaContent(response.data);
        setContents((prev) => [persistedContent, ...prev]);
      }

      setShowBuilder(false);
      setEditingContent(null);
    } catch (error) {
      console.error("Enregistrement impossible en base de données:", error);
      const msg = getApiErrorMessage(error, "L'enregistrement a échoué côté serveur.");
      window.alert(msg);
    }
  };

  const scrollToTop = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (showBuilder) {
    return (
      <ContentBuilder
        content={editingContent}
        onSave={handleSaveContent}
        onCancel={() => {
          setShowBuilder(false);
          setEditingContent(null);
        }}
      />
    );
  }

  const totalContents = contents.length;
  const publishedContents = contents.filter(c => c.status === 'published').length;
  const previewAssets = previewContent ? buildPreviewAssets(previewContent) : [];
  const selectedPreviewAsset = previewAssets.find((asset) => asset.id === selectedPreviewAssetId) || previewAssets[0];

  return (
    <>
      <div className="min-h-screen p-6 space-y-6 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.18),transparent_42%),linear-gradient(to_bottom,#f8fafc,#f1f5f9)]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/85 backdrop-blur p-6 shadow-xl">
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-300/35 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-300/35 blur-3xl" />
          <div className="relative flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bibliotheque JoyatWork</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Contenus</h1>
              <p className="mt-2 text-slate-600">Gerez tous vos contenus et ressources JoyatWork</p>
              {isLoadingContents && <p className="mt-1 text-xs text-slate-500">Chargement depuis la base de donnees...</p>}
            </div>
            <Button
              onClick={() => setShowBuilder(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Creer contenu
            </Button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-emerald-100 bg-white/90 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Total contenus</CardTitle>
              <BarChart3 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-900">{totalContents}</div>
              <p className="text-xs text-slate-500">
                {publishedContents} publiés
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur p-4 md:p-5 shadow-lg">
          {/* Filters */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher un contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-80 border-slate-300 focus-visible:ring-emerald-500"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 border-slate-300">
                  <Filter className="h-4 w-4 mr-2 text-emerald-600" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="meditation">Méditation</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="challenge">Défi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterThematic} onValueChange={setFilterThematic}>
                <SelectTrigger className="w-40 border-slate-300">
                  <SelectValue placeholder="Thématique" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes thématiques</SelectItem>
                  <SelectItem value="stress">Stress</SelectItem>
                  <SelectItem value="énergie">Énergie</SelectItem>
                  <SelectItem value="sommeil">Sommeil</SelectItem>
                  <SelectItem value="focus">Focus</SelectItem>
                  <SelectItem value="bien-être">Bien-être</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-slate-300">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-300"}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-emerald-600 hover:bg-emerald-700" : "border-slate-300"}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onEdit={handleEditContent}
                  onPreview={handlePreviewContent}
                  onDelete={handleDeleteContent}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContents.map((content) => (
                <Card key={content.id} className="hover:shadow-xl hover:-translate-y-0.5 transition-all border-slate-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl">
                            {getTypeIcon(content.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{content.title}</h3>
                              {content.isPinned && <Badge variant="secondary">📌 Épinglé</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{content.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{content.duration > 0 ? `${content.duration}min` : 'Variable'}</span>
                              <Badge className={getStatusColor(content.status)}>
                                {content.status === 'published' ? 'Publié' : content.status === 'draft' ? 'Brouillon' : 'Archivé'}
                              </Badge>
                              <span>{content.views} vues</span>
                              {content.rating && <span>⭐ {content.rating}/5</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewContent(content)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Aperçu
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContent(content)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContent(content)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-2">
                        <p className="text-center text-xs font-medium text-slate-500">
                          {content.status === "published" ? "Publie par" : "Enregistre par"} @{content.author}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={Boolean(contentToDelete)} onOpenChange={(open) => !open && setContentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contenu ?</AlertDialogTitle>
            <AlertDialogDescription>
              {contentToDelete
                ? `Le contenu "${contentToDelete.title}" sera supprimé définitivement.`
                : "Cette action est irréversible."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteContent}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(previewContent)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewContent(null);
            setSelectedPreviewAssetId("");
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu du contenu</DialogTitle>
            <DialogDescription>
              Fiche profil du contenu avec vos informations et vos fichiers.
            </DialogDescription>
          </DialogHeader>

          {previewContent && (
            <div className="space-y-5">
              <div className="relative h-56 w-full overflow-hidden rounded-xl border bg-muted">
                {previewContent.thumbnail ? (
                  <img
                    src={normalizeAssetUrl(previewContent.thumbnail)}
                    alt={previewContent.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-6xl">
                    {getTypeIcon(previewContent.type)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold leading-tight">{previewContent.title}</h3>
                  <p className="text-sm text-white/90">Par {previewContent.author}</p>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-4">
                <p className="text-sm text-muted-foreground">{previewContent.description || "Aucune description"}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(previewContent.status)}>
                    {previewContent.status === "published" ? "Publié" : "Brouillon"}
                  </Badge>
                  <Badge variant="secondary">{previewContent.type}</Badge>
                  <Badge variant="outline">{previewContent.duration > 0 ? `${previewContent.duration} min` : "Variable"}</Badge>
                  <Badge variant="outline">Langue: {previewContent.language || "fr"}</Badge>
                  <Badge variant="outline">Intensité: {previewContent.intensity || "léger"}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Thématiques</p>
                    <p className="text-sm">{previewContent.thematic?.join(", ") || "-"}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Tags</p>
                    <p className="text-sm">{previewContent.tags?.join(" ") || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-3">
                <p className="text-sm font-medium">Fichiers ajoutés</p>
                <div className="flex gap-2">
                  <Select
                    value={selectedPreviewAsset?.id || ""}
                    onValueChange={(value) => {
                      setSelectedPreviewAssetId(value);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Choisir un fichier" />
                    </SelectTrigger>
                    <SelectContent>
                      {previewAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>{asset.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAssetInNewTab(selectedPreviewAsset)}
                    disabled={!selectedPreviewAsset}
                  >
                    Ouvrir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bouton Scroll to Top */}
      <button
        onClick={scrollToTop}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          backgroundColor: "#16a34a",
          color: "white",
          padding: "0.75rem",
          borderRadius: "50%",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 9999,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#15803d";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#16a34a";
        }}
        title="Retour au haut"
      >
        <ChevronUp style={{ width: "24px", height: "24px" }} />
      </button>
    </>
  );
};

export default ContentLibraryPage;
