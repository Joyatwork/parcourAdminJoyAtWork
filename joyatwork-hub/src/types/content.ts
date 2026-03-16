export type ContentType = 'meditation' | 'video' | 'audio' | 'article' | 'challenge' | 'tool' | 'pdf' | 'guide';

export type ContentStatus = 'published' | 'draft' | 'archived' | 'scheduled';

export type ContentVisibility = 'all' | 'practitioners' | 'managers' | 'hr' | 'specific_companies' | 'private';

export type ContentIntensity = 'léger' | 'modéré' | 'intense';

export interface MediaContent {
  id: number;
  title: string;
  description: string;
  type: ContentType;
  format: string; // mp4, mp3, pdf, etc.
  duration: number; // in minutes, 0 for non-timed content
  thematic: string[]; // stress, énergie, sommeil, etc.
  tags: string[];
  status: ContentStatus;
  language: string;
  visibility: ContentVisibility;
  intensity: ContentIntensity;
  level?: 'novice' | 'habitué' | 'expert';

  // Author and dates
  author: string;
  createdAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
  updatedAt?: Date;

  // Media files
  thumbnail?: string;
  fileUrl?: string;
  annexFiles?: Array<{
    name: string;
    url: string;
    type: string;
  }>;

  // Access control
  companies: string[]; // specific companies if visibility is restricted
  practitionerOnly?: boolean;

  // Statistics
  views: number;
  completionRate: number; // percentage
  averageWatchTime?: number; // in minutes
  rating?: number;
  feedback?: Array<{
    userId: string;
    rating: number;
    comment?: string;
    date: Date;
  }>;

  // Content organization
  collections?: string[];
  isPinned: boolean;
  isHotContent: boolean; // automatically detected high-impact content

  // Additional features
  hasQuiz?: boolean;
  practitionerGuide?: string; // URL to practitioner-only guide
  customization?: {
    visualTheme?: string;
    audioAmbient?: string;
  };

  // SEO and search
  keywords?: string[];
  searchBoost?: number;
}

export interface ContentCollection {
  id: number;
  name: string;
  description?: string;
  contentIds: number[];
  author: string;
  createdAt: Date;
  isPublic: boolean;
  theme?: string;
  color?: string;
}

export interface ContentStats {
  totalViews: number;
  averageRating: number;
  completionRate: number;
  engagementScore: number;
  topPerformers: MediaContent[];
  underPerformers: MediaContent[];
  trendingTopics: string[];
  userSegmentPreferences: Record<string, string[]>;
}
