export type InsightSource = 'manual' | 'feedback' | 'feynman' | 'solve';

export interface Insight {
  id: string;
  text: string;
  chapter?: string;
  tags: string[];
  createdAt: string;
  source: InsightSource;
}

export interface InsightsStore {
  version: number;
  insights: Insight[];
}

export interface ChapterProgress {
  studied: boolean;
  studiedAt?: string;
  items: string[];
  notes: string[];
  insightCount: number;
}

export interface ProgressStore {
  version: number;
  chapters: Record<string, ChapterProgress>;
}
