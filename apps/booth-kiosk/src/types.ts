export interface Game {
  id: string;
  name: string;
  description: string;
  mascotID: number;
  mascotImage?: string;
  themeColor?: string;
  ageGroups: number[];
  difficulty: ('easy' | 'medium' | 'hard')[];
  estimatedPlaytime: number;
  featured: boolean;
}
