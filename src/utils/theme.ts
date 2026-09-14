import { ThemeMode } from '../types';

export interface ThemeColors {
  mode: ThemeMode;
  name: string;
  bgClass: string;
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  primaryGradient: string;
  primaryText: string;
  primaryBadge: string;
  secondaryText: string;
  tabActiveBg: string;
  tabActiveText: string;
  textMain: string;
  textMuted: string;
  accentBadgeBg: string;
  accentBadgeText: string;
  glowColor: string;
  logoBorder: string;
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  zafiro: {
    mode: 'zafiro',
    name: 'Zafiro Celestial',
    bgClass: 'bg-[#060d24]',
    cardBg: 'bg-gradient-to-br from-[#0b1536] via-[#101d47] to-[#182b63]',
    cardBorder: 'border-sky-500/30',
    headerBg: 'bg-[#060d24]/90 border-sky-500/20',
    primaryGradient: 'bg-gradient-to-r from-amber-500 to-amber-400',
    primaryText: 'text-amber-400',
    primaryBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    secondaryText: 'text-sky-400',
    tabActiveBg: 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_2px_12px_rgba(245,158,11,0.35)]',
    tabActiveText: 'text-[#1f1000]',
    textMain: 'text-[#f0f6ff]',
    textMuted: 'text-[#94a3b8]',
    accentBadgeBg: 'bg-sky-500/15',
    accentBadgeText: 'text-sky-300',
    glowColor: 'rgba(56,189,248,0.15)',
    logoBorder: 'border-sky-400/40 ring-sky-500/30',
  },
  vino: {
    mode: 'vino',
    name: 'Vino Litúrgico',
    bgClass: 'bg-[#180510]',
    cardBg: 'bg-gradient-to-br from-[#2a0b18] via-[#220715] to-[#180510]',
    cardBorder: 'border-amber-500/25',
    headerBg: 'bg-[#180510]/90 border-[#44182a]/70',
    primaryGradient: 'bg-gradient-to-r from-amber-500 to-amber-600',
    primaryText: 'text-amber-400',
    primaryBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    secondaryText: 'text-rose-300',
    tabActiveBg: 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_2px_12px_rgba(245,158,11,0.35)]',
    tabActiveText: 'text-[#1f0a00]',
    textMain: 'text-[#faeedf]',
    textMuted: 'text-[#e6c8be]',
    accentBadgeBg: 'bg-[#341220]',
    accentBadgeText: 'text-amber-200/90',
    glowColor: 'rgba(251,191,36,0.15)',
    logoBorder: 'border-amber-500/40 ring-amber-500/30',
  },
  esmeralda: {
    mode: 'esmeralda',
    name: 'Verde Esperanza',
    bgClass: 'bg-[#071f17]',
    cardBg: 'bg-gradient-to-br from-[#0c2e24] via-[#0a271f] to-[#041510]',
    cardBorder: 'border-[#1a493c]/80',
    headerBg: 'bg-[#071f17]/90 border-[#1a493c]/50',
    primaryGradient: 'bg-gradient-to-r from-[#eab308] to-[#facc15]',
    primaryText: 'text-[#facc15]',
    primaryBadge: 'bg-[#065f46] text-[#a7f3d0] border-[#34d399]/40',
    secondaryText: 'text-[#34d399]',
    tabActiveBg: 'bg-gradient-to-r from-[#eab308] to-[#facc15] shadow-[0_2px_10px_rgba(234,179,8,0.3)]',
    tabActiveText: 'text-[#261800]',
    textMain: 'text-[#e8f5e9]',
    textMuted: 'text-[#a5cfbe]',
    accentBadgeBg: 'bg-[#123b30]',
    accentBadgeText: 'text-[#34d399]',
    glowColor: 'rgba(52,211,153,0.15)',
    logoBorder: 'border-emerald-400/40 ring-emerald-500/30',
  },
};
