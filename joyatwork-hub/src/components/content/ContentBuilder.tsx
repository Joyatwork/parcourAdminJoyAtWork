import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Save,
  FileText,
  Image,
  Music,
  Video,
  Target,
} from "lucide-react";
import { MediaContent, ContentType } from "@/types/content";

export interface ContentUploadFiles {
  mainFile?: File | null;
  thumbnailFile?: File | null;
  practitionerGuideFile?: File | null;
  annexFiles?: File[];
}

interface ContentBuilderProps {
  content?: MediaContent | null;
  onSave: (content: Partial<MediaContent>, files: ContentUploadFiles) => void;
  onCancel: () => void;
}

export function ContentBuilder({ content, onSave, onCancel }: ContentBuilderProps) {
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

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const annexFileInputRef = useRef<HTMLInputElement | null>(null);
  const practitionerGuideInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<Partial<MediaContent>>({
    defaultValues: {
      title: "",
      description: "",
      type: "video",
      format: "mp4",
      duration: 0,
      thematic: [],
      tags: [],
      status: "draft",
      language: "fr",
      visibility: "all",
      intensity: "léger",
      author: getCurrentUserFullName(),
      companies: [],
      isPinned: false,
      isHotContent: false,
      ...content
    }
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentThematic, setCurrentThematic] = useState("");
  const [mainFileName, setMainFileName] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState(content?.thumbnail || "");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [practitionerGuideName, setPractitionerGuideName] = useState("");
  const [annexFileNames, setAnnexFileNames] = useState<string[]>(
    content?.annexFiles?.map((file) => file.name) || []
  );
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [practitionerGuideFile, setPractitionerGuideFile] = useState<File | null>(null);
  const [annexUploadFiles, setAnnexUploadFiles] = useState<File[]>([]);

  const contentTypes: Array<{ value: ContentType; label: string; icon: React.ReactNode }> = [
    { value: "meditation", label: "Méditation", icon: "🧘" },
    { value: "video", label: "Vidéo", icon: <Video className="h-4 w-4" /> },
    { value: "audio", label: "Audio", icon: <Music className="h-4 w-4" /> },
    { value: "article", label: "Article", icon: <FileText className="h-4 w-4" /> },
    { value: "challenge", label: "Défi", icon: <Target className="h-4 w-4" /> },
    { value: "tool", label: "Outil", icon: "🛠️" },
    { value: "pdf", label: "Guide PDF", icon: "📄" },
  ];

  const availableThematics = [
    "stress", "énergie", "sommeil", "focus", "bien-être", "nutrition",
    "leadership", "organisation", "communication", "créativité", "motivation"
  ];

  const handleSubmit = (data: Partial<MediaContent>, status: "draft" | "published") => {
    onSave({
      ...data,
      status,
      publishedAt: status === "published" ? content?.publishedAt || new Date() : content?.publishedAt,
      updatedAt: new Date(),
    }, {
      mainFile,
      thumbnailFile,
      practitionerGuideFile,
      annexFiles: annexUploadFiles,
    });
  };

  const addTag = () => {
    const currentTags = form.getValues("tags") || [];
    if (currentTag.trim() && !currentTags.includes(currentTag.trim())) {
      form.setValue("tags", [...currentTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(tag => tag !== tagToRemove));
  };

  const addThematic = () => {
    const currentThematics = form.getValues("thematic") || [];
    if (currentThematic && !currentThematics.includes(currentThematic)) {
      form.setValue("thematic", [...currentThematics, currentThematic]);
      setCurrentThematic("");
    }
  };

  const removeThematic = (thematicToRemove: string) => {
    const currentThematics = form.getValues("thematic") || [];
    form.setValue("thematic", currentThematics.filter(theme => theme !== thematicToRemove));
  };

  const handleMainFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previousUrl = form.getValues("fileUrl");
    if (previousUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    form.setValue("fileUrl", objectUrl);
    form.setValue("format", file.name.split(".").pop() || file.type || "file");
    setMainFile(file);
    setMainFileName(file.name);
    event.target.value = "";
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    form.setValue("thumbnail", objectUrl);
    setThumbnailFile(file);
    setThumbnailPreview(objectUrl);
    setThumbnailFileName(file.name);
    event.target.value = "";
  };

  const handleAnnexFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const currentAnnexFiles = form.getValues("annexFiles") || [];
    const newAnnexFiles = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || file.name.split(".").pop() || "file",
    }));

    form.setValue("annexFiles", [...currentAnnexFiles, ...newAnnexFiles]);
    setAnnexUploadFiles((prev) => [...prev, ...files]);
    setAnnexFileNames((prev) => [...prev, ...files.map((file) => file.name)]);
    event.target.value = "";
  };

  const handlePractitionerGuideChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previousUrl = form.getValues("practitionerGuide");
    if (previousUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    form.setValue("practitionerGuide", objectUrl);
    setPractitionerGuideFile(file);
    setPractitionerGuideName(file.name);
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {content ? "Modifier le contenu" : "Créer un contenu"}
                </h1>
                <p className="text-muted-foreground">
                  {content ? `Modification de "${content.title}"` : "Nouveau contenu pour la bibliothèque média"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit((data) => handleSubmit(data, "draft"))}
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit((data) => handleSubmit(data, "published"))}
              >
                Publier
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => handleSubmit(data, "draft"))}>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Informations</TabsTrigger>
                <TabsTrigger value="content">Contenu</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informations générales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titre *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Titre de votre contenu" required />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Description détaillée du contenu" rows={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type de contenu *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {contentTypes.map(type => (
                                      <SelectItem key={type.value} value={type.value}>
                                        <div className="flex items-center gap-2">
                                          {type.icon}
                                          {type.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Durée (minutes)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    placeholder="0 pour contenu sans durée"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="intensity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Intensité</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="léger">Léger</SelectItem>
                                    <SelectItem value="modéré">Modéré</SelectItem>
                                    <SelectItem value="intense">Intense</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Langue</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="fr">Français</SelectItem>
                                    <SelectItem value="en">Anglais</SelectItem>
                                    <SelectItem value="es">Espagnol</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Thématiques et tags</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Thématiques</Label>
                          <div className="flex gap-2">
                            <Select value={currentThematic} onValueChange={setCurrentThematic}>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Sélectionner une thématique" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableThematics.map(theme => (
                                  <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button type="button" onClick={addThematic} disabled={!currentThematic}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {form.getValues("thematic")?.map(theme => (
                              <Badge key={theme} variant="secondary">
                                {theme}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-auto p-0"
                                  onClick={() => removeThematic(theme)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags personnalisés</Label>
                          <div className="flex gap-2">
                            <Input
                              id="tags"
                              value={currentTag}
                              onChange={(e) => setCurrentTag(e.target.value)}
                              placeholder="Ajouter un tag (ex: #autonome)"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag();
                                }
                              }}
                            />
                            <Button type="button" onClick={addTag} disabled={!currentTag.trim()}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {form.getValues("tags")?.map(tag => (
                              <Badge key={tag} variant="outline">
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="ml-2 h-auto p-0"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Publication</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
                          Tant que vous cliquez sur <span className="font-medium text-foreground">Enregistrer</span>, le contenu reste en brouillon. Utilisez <span className="font-medium text-foreground">Publier</span> pour le mettre en ligne.
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Contenu épinglé</Label>
                            <p className="text-sm text-muted-foreground">Mettre en avant dans la bibliothèque</p>
                          </div>
                          <FormField
                            control={form.control}
                            name="isPinned"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Fichiers et médias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <input
                      ref={mainFileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleMainFileChange}
                    />
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleThumbnailChange}
                    />
                    <input
                      ref={annexFileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleAnnexFilesChange}
                    />
                    <input
                      ref={practitionerGuideInputRef}
                      type="file"
                      className="hidden"
                      onChange={handlePractitionerGuideChange}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Fichier principal</Label>
                          <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Glissez-déposez votre fichier ou cliquez pour sélectionner
                            </p>
                            {mainFileName && (
                              <p className="mt-3 text-sm font-medium text-foreground">{mainFileName}</p>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4"
                              onClick={() => mainFileInputRef.current?.click()}
                            >
                              Choisir un fichier
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Image de couverture</Label>
                          <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                            {thumbnailPreview ? (
                              <img
                                src={thumbnailPreview}
                                alt="Aperçu de couverture"
                                className="mx-auto mb-3 h-28 w-28 rounded-lg object-cover"
                              />
                            ) : (
                              <Image className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            )}
                            <p className="text-sm text-muted-foreground">
                              Ajoutez une image d'illustration
                            </p>
                            {thumbnailFileName && (
                              <p className="mt-3 text-sm font-medium text-foreground">{thumbnailFileName}</p>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4"
                              onClick={() => thumbnailInputRef.current?.click()}
                            >
                              Choisir une image
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Fichiers annexes (optionnel)</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            PDF, guides, fiches à télécharger
                          </p>
                          {annexFileNames.length > 0 && (
                            <div className="mb-3 space-y-1 text-sm text-foreground">
                              {annexFileNames.map((name) => (
                                <div key={name}>{name}</div>
                              ))}
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => annexFileInputRef.current?.click()}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un fichier annexe
                          </Button>
                        </div>

                        <div>
                          <Label>Guide praticien (optionnel)</Label>
                          <p className="text-sm text-muted-foreground mb-2">
                            Document interne pour les praticiens
                          </p>
                          {practitionerGuideName && (
                            <p className="mb-3 text-sm font-medium text-foreground">{practitionerGuideName}</p>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => practitionerGuideInputRef.current?.click()}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ajouter guide praticien
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
