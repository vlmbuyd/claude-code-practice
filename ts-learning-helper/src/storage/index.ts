import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import type { Insight, InsightSource, InsightsStore, ProgressStore, ChapterProgress } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data');
const INSIGHTS_FILE = path.join(DATA_DIR, 'insights.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readInsights(): InsightsStore {
  ensureDataDir();
  if (!fs.existsSync(INSIGHTS_FILE)) {
    return { version: 1, insights: [] };
  }
  return JSON.parse(fs.readFileSync(INSIGHTS_FILE, 'utf-8')) as InsightsStore;
}

function writeInsights(store: InsightsStore): void {
  ensureDataDir();
  fs.writeFileSync(INSIGHTS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

function readProgress(): ProgressStore {
  ensureDataDir();
  if (!fs.existsSync(PROGRESS_FILE)) {
    return { version: 1, chapters: {} };
  }
  return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8')) as ProgressStore;
}

function writeProgress(store: ProgressStore): void {
  ensureDataDir();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function getInsights(): Insight[] {
  return readInsights().insights;
}

export function addInsight(
  text: string,
  options: { chapter?: string; tags?: string[]; source?: InsightSource } = {}
): Insight {
  const store = readInsights();
  const insight: Insight = {
    id: randomUUID(),
    text,
    chapter: options.chapter,
    tags: options.tags ?? [],
    createdAt: new Date().toISOString(),
    source: options.source ?? 'manual',
  };
  store.insights.push(insight);
  writeInsights(store);
  return insight;
}

export function searchInsights(query: string): Insight[] {
  const insights = getInsights();
  const q = query.toLowerCase();
  return insights.filter(
    (i) =>
      i.text.toLowerCase().includes(q) ||
      i.tags.some((t) => t.toLowerCase().includes(q)) ||
      i.chapter?.includes(q)
  );
}

export function getProgress(): ProgressStore {
  return readProgress();
}

export function markChapter(chapter: string, items: string[] = []): void {
  const store = readProgress();
  const existing = store.chapters[chapter] ?? {
    studied: false,
    items: [],
    notes: [],
    insightCount: 0,
  };
  store.chapters[chapter] = {
    ...existing,
    studied: true,
    studiedAt: new Date().toISOString(),
    items: items.length > 0 ? items : existing.items,
  };
  writeProgress(store);
}

export function addProgressNote(chapter: string, note: string): void {
  const store = readProgress();
  const existing: ChapterProgress = store.chapters[chapter] ?? {
    studied: false,
    items: [],
    notes: [],
    insightCount: 0,
  };
  existing.notes.push(note);
  store.chapters[chapter] = existing;
  writeProgress(store);
}

export function incrementInsightCount(chapter: string): void {
  const store = readProgress();
  const existing: ChapterProgress = store.chapters[chapter] ?? {
    studied: false,
    items: [],
    notes: [],
    insightCount: 0,
  };
  existing.insightCount = (existing.insightCount ?? 0) + 1;
  store.chapters[chapter] = existing;
  writeProgress(store);
}
