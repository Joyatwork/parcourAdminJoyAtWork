import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Play, Edit, Clock, Pin, Trash2 } from "lucide-react";
import { MediaContent, ContentType } from "@/types/content";

interface ContentCardProps {
  content: MediaContent;
  onEdit: (content: MediaContent) => void;
  onPreview: (content: MediaContent) => void;
  onDelete: (content: MediaContent) => void;
}

export function ContentCard({ content, onEdit, onPreview, onDelete }: ContentCardProps) {
  const authorLabel = content.status === "published" ? "Publie par" : "Enregistre par";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800 border-green-200";
      case "draft": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "léger": return "bg-blue-100 text-blue-800";
      case "modéré": return "bg-orange-100 text-orange-800";
      case "intense": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 bg-white/95">
      <CardHeader className="p-0">
        <div className="relative">
          {content.thumbnail ? (
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-emerald-50 via-sky-50 to-teal-100 rounded-t-lg flex items-center justify-center">
              <span className="text-6xl opacity-50">{getTypeIcon(content.type)}</span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />

          {/* Overlays */}
          <div className="absolute top-3 left-3 flex gap-2">
            {content.isPinned && (
              <Badge className="bg-blue-500 text-white shadow-sm">
                <Pin className="h-3 w-3 mr-1" />
                Épinglé
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge className={getStatusColor(content.status) + " shadow"}>
              {content.status === 'published' ? 'Publié' :
               content.status === 'draft' ? 'Brouillon' : 'Archivé'}
            </Badge>
          </div>

          {content.duration > 0 && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-black/70 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {content.duration}min
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
              {content.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {content.description}
            </p>
          </div>

          {/* Tags and thematic */}
          <div className="flex flex-wrap gap-1">
            {content.thematic.slice(0, 2).map(theme => (
              <Badge key={theme} variant="secondary" className="text-xs bg-sky-100 text-sky-700">
                {theme}
              </Badge>
            ))}
            <Badge className={getIntensityColor(content.intensity) + " text-xs border"}>
              {content.intensity}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-1 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onPreview(content)}
            >
              <Play className="h-3 w-3 mr-1" />
              Aperçu
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => onEdit(content)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:border-red-300 hover:bg-red-50"
              onClick={() => onDelete(content)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          <div className="border-t border-slate-100 pt-2">
            <p className="text-center text-xs font-medium text-slate-500">
              {authorLabel} @{content.author}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
