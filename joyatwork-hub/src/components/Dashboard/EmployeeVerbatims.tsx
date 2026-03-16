import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Heart, 
  Briefcase, 
  Users2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Verbatim {
  id: number;
  category: "engagement" | "conditions" | "relations";
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  date: string;
  anonymous: boolean;
}

const verbatimsData: Verbatim[] = [
  {
    id: 1,
    category: "engagement",
    text: "Je me sens vraiment valorisé dans mon travail. Les opportunités de développement sont excellentes.",
    sentiment: "positive",
    sentimentScore: 85,
    date: "2025-09-28",
    anonymous: true
  },
  {
    id: 2,
    category: "conditions",
    text: "Les outils de travail sont performants mais l'espace de travail pourrait être amélioré.",
    sentiment: "neutral",
    sentimentScore: 60,
    date: "2025-09-27",
    anonymous: false
  },
  {
    id: 3,
    category: "relations",
    text: "La communication avec mon manager est excellente. Je me sens écouté et soutenu.",
    sentiment: "positive",
    sentimentScore: 90,
    date: "2025-09-26",
    anonymous: true
  },
  {
    id: 4,
    category: "engagement",
    text: "Le manque de reconnaissance de mes efforts me démotive progressivement.",
    sentiment: "negative",
    sentimentScore: 25,
    date: "2025-09-25",
    anonymous: true
  },
  {
    id: 5,
    category: "conditions",
    text: "La charge de travail est devenue ingérable ces dernières semaines.",
    sentiment: "negative",
    sentimentScore: 20,
    date: "2025-09-24",
    anonymous: false
  },
  {
    id: 6,
    category: "relations",
    text: "L'équipe est solidaire mais la collaboration inter-services reste difficile.",
    sentiment: "neutral",
    sentimentScore: 55,
    date: "2025-09-23",
    anonymous: true
  }
];

const categoryConfig = {
  engagement: {
    label: "Engagement & Motivation",
    icon: Heart,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/20"
  },
  conditions: {
    label: "Conditions & Organisation",
    icon: Briefcase,
    colorClass: "text-accent",
    bgClass: "bg-accent/10",
    borderClass: "border-accent/20"
  },
  relations: {
    label: "Relations & Management",
    icon: Users2,
    colorClass: "text-secondary",
    bgClass: "bg-secondary/10",
    borderClass: "border-secondary/20"
  }
};

const sentimentConfig = {
  positive: { label: "Positif", variant: "default" as const, icon: TrendingUp },
  neutral: { label: "Neutre", variant: "secondary" as const, icon: MessageSquare },
  negative: { label: "Négatif", variant: "destructive" as const, icon: TrendingDown }
};

export function EmployeeVerbatims() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredVerbatims = selectedCategory
    ? verbatimsData.filter(v => v.category === selectedCategory)
    : verbatimsData;

  const currentVerbatim = filteredVerbatims[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredVerbatims.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [filteredVerbatims.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredVerbatims.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredVerbatims.length) % filteredVerbatims.length);
  };

  const getCategoryStats = () => {
    const stats = {
      engagement: { total: 0, positive: 0, negative: 0, trend: 0 },
      conditions: { total: 0, positive: 0, negative: 0, trend: 0 },
      relations: { total: 0, positive: 0, negative: 0, trend: 0 }
    };

    verbatimsData.forEach(v => {
      stats[v.category].total++;
      if (v.sentiment === "positive") stats[v.category].positive++;
      if (v.sentiment === "negative") stats[v.category].negative++;
    });

    // Calcul du trend (simplification: positif - négatif)
    Object.keys(stats).forEach(key => {
      const cat = key as keyof typeof stats;
      stats[cat].trend = stats[cat].positive - stats[cat].negative;
    });

    return stats;
  };

  const stats = getCategoryStats();
  const negativeCount = verbatimsData.filter(v => v.sentiment === "negative").length;

  if (!currentVerbatim) return null;

  const config = categoryConfig[currentVerbatim.category];
  const CategoryIcon = config.icon;
  const sentimentInfo = sentimentConfig[currentVerbatim.sentiment];
  const SentimentIcon = sentimentInfo.icon;

  return (
    <Card className="p-6 shadow-soft">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgClass}`}>
              <MessageSquare className={`w-5 h-5 ${config.colorClass}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold">Verbatims Collaborateurs</h3>
              <p className="text-sm text-muted-foreground">Retours terrain classés par thématique</p>
            </div>
          </div>
          {negativeCount > 2 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {negativeCount} alertes
            </Badge>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="text-xs"
          >
            Tous ({verbatimsData.length})
          </Button>
          {Object.entries(categoryConfig).map(([key, cat]) => {
            const CategoryFilterIcon = cat.icon;
            const categoryStats = stats[key as keyof typeof stats];
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="text-xs gap-1.5"
              >
                <CategoryFilterIcon className="w-3 h-3" />
                {categoryStats.total}
              </Button>
            );
          })}
        </div>

        {/* Main verbatim display */}
        <div className={`relative border-2 ${config.borderClass} rounded-lg p-6 ${config.bgClass} transition-all duration-300`}>
          <div className="space-y-4">
            {/* Category & Sentiment badges */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CategoryIcon className={`w-4 h-4 ${config.colorClass}`} />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <Badge variant={sentimentInfo.variant} className="gap-1">
                <SentimentIcon className="w-3 h-3" />
                {sentimentInfo.label}
              </Badge>
            </div>

            {/* Verbatim text */}
            <blockquote className="text-base leading-relaxed border-l-4 border-primary pl-4 italic">
              "{currentVerbatim.text}"
            </blockquote>

            {/* Sentiment score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Score de sentiment</span>
                <span className="font-medium">{currentVerbatim.sentimentScore}%</span>
              </div>
              <Progress value={currentVerbatim.sentimentScore} className="h-2" />
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentVerbatim.anonymous ? "Commentaire anonyme" : "Commentaire identifié"}</span>
              <span>{new Date(currentVerbatim.date).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background border rounded-full px-2 py-1 shadow-medium">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrev}
              className="h-6 w-6 p-0 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              {currentIndex + 1} / {filteredVerbatims.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="h-6 w-6 p-0 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Category insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {Object.entries(categoryConfig).map(([key, cat]) => {
            const categoryStats = stats[key as keyof typeof stats];
            const TrendIcon = categoryStats.trend >= 0 ? TrendingUp : TrendingDown;
            const positiveRate = categoryStats.total > 0 
              ? Math.round((categoryStats.positive / categoryStats.total) * 100)
              : 0;

            return (
              <div
                key={key}
                className={`p-3 rounded-lg border ${cat.borderClass} ${cat.bgClass} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{cat.label.split(' ')[0]}</span>
                  <TrendIcon className={`w-3 h-3 ${categoryStats.trend >= 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div className="text-lg font-bold">{positiveRate}%</div>
                <div className="text-xs text-muted-foreground">
                  {categoryStats.positive} positifs / {categoryStats.total} total
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
