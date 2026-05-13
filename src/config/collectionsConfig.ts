import type { ComponentType } from 'react';
import {
  FiAward,
  FiClock,
  FiGrid,
  FiHeart,
  FiStar,
  FiZap,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export type IconComponent = ComponentType<{ size?: number; className?: string }>;

/**
 * Maps collection icon keys (as stored in the API) to React icon components.
 * Shared between Collections list and CollectionDetail pages.
 */
export const COLLECTION_ICON_MAP: Record<string, IconComponent> = {
  Heart: FiHeart,
  Star: FiStar,
  Trophy: FiAward,
  Clock: FiClock,
  Grid: FiGrid,
  Sparkles: HiSparkles,
  Flame: FiZap,
  Zap: FiZap,
};

/**
 * Maps color keys to Tailwind gradient accent classes.
 */
export const COLLECTION_COLOR_ACCENT_MAP: Record<string, string> = {
  Rose: 'from-rose-500/90 to-rose-500/30',
  Blue: 'from-blue-500/90 to-blue-500/30',
  Purple: 'from-violet-500/90 to-violet-500/30',
  Emerald: 'from-emerald-500/90 to-emerald-500/30',
  Orange: 'from-orange-500/90 to-orange-500/30',
  Pink: 'from-pink-500/90 to-pink-500/30',
  Indigo: 'from-indigo-500/90 to-indigo-500/30',
  Yellow: 'from-amber-400/90 to-amber-500/30',
};

/**
 * Maps color keys to arrays of 4 tile-preview gradient classes.
 */
export const COLLECTION_COLOR_PREVIEW_MAP: Record<string, string[]> = {
  Rose: [
    'from-rose-500/80 via-rose-400/20 to-slate-950',
    'from-fuchsia-500/80 via-rose-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-orange-500/75 via-rose-500/20 to-slate-950',
  ],
  Blue: [
    'from-blue-500/80 via-sky-400/25 to-slate-950',
    'from-cyan-500/80 via-blue-400/25 to-slate-950',
    'from-slate-100/90 via-slate-300/30 to-slate-950',
    'from-indigo-500/75 via-blue-500/20 to-slate-950',
  ],
  Purple: [
    'from-violet-500/80 via-fuchsia-500/25 to-slate-950',
    'from-fuchsia-500/80 via-violet-500/20 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-indigo-500/75 via-violet-500/20 to-slate-950',
  ],
  Emerald: [
    'from-emerald-500/80 via-green-400/25 to-slate-950',
    'from-teal-500/80 via-emerald-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-lime-500/75 via-emerald-500/20 to-slate-950',
  ],
  Orange: [
    'from-orange-500/80 via-amber-400/25 to-slate-950',
    'from-amber-500/80 via-orange-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-rose-500/75 via-orange-500/20 to-slate-950',
  ],
  Pink: [
    'from-pink-500/80 via-rose-400/25 to-slate-950',
    'from-fuchsia-500/80 via-pink-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-violet-500/75 via-pink-500/20 to-slate-950',
  ],
  Indigo: [
    'from-indigo-500/80 via-blue-400/25 to-slate-950',
    'from-violet-500/80 via-indigo-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-cyan-500/75 via-indigo-500/20 to-slate-950',
  ],
  Yellow: [
    'from-amber-400/80 via-yellow-300/25 to-slate-950',
    'from-orange-500/80 via-amber-400/25 to-slate-950',
    'from-zinc-100/90 via-zinc-300/35 to-slate-950',
    'from-rose-500/75 via-amber-500/20 to-slate-950',
  ],
};

/**
 * Converts a snake_case, kebab-case, or space-separated string into Title Case.
 * Falls back to `fallback` when the value is null/undefined/empty.
 */
export const toCollectionTitle = (
  value: string | null | undefined,
  fallback: string,
): string => {
  if (!value) return fallback;
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};
