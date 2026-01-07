// components/Challenges/types.ts
export interface ChallengeCategory {
  id: number;
  name: string;
}

export interface ChallengeType {
  id: number;
  name: string;
}

export interface ChallengeIntensity {
  id: number;
  name: string;
}

export interface Challenge {
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

export interface participantsParDefi {
  id: number; 
  name: string;
  email: string;
  score: number;
  rate: number;
}

export interface ChallengePack {
  id: number;
  name: string;
  description: string;
  challenges_count?: number;
  created_at: string;
  updated_at: string;
}