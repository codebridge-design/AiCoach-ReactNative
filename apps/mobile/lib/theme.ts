import { useSettingsStore } from '../stores/settingsStore';

export interface ThemeTokens {
  // Backgrounds
  bg: string;           // Main page/screen background
  surface: string;      // Card, list item, input background
  elevated: string;     // Icon wells, tags, subtle elevation
  // Borders
  border: string;       // Card borders, section dividers
  borderMuted: string;  // Chip borders, toggle, input outline
  // Text
  fg: string;           // Primary text
  fgMuted: string;      // Secondary text, captions, placeholder
  // Brand
  blue700: string;      // Primary interactive accent (links, icons)
  blue800: string;      // Navy brand color — hero sections stay identical in both modes
  blue900: string;
  green: string;
  greenSoft: string;    // Soft green tint for success backgrounds
  amber: string;
  red: string;
  white: string;        // Always pure white (for text/icons on colored surfaces)
  // Computed tints (semi-transparent icon bg fills)
  accentSoft: string;   // Blue icon-well tint
  amberSoft: string;    // Amber icon-well tint
  isDark: boolean;
}

export const LIGHT_THEME: ThemeTokens = {
  bg: '#FDFDFD',
  surface: '#FFFFFF',
  elevated: '#ECF1F6',
  border: '#E3E9ED',
  borderMuted: '#D1D8DD',
  fg: '#1F2C37',
  fgMuted: '#78828A',
  blue700: '#0159A6',
  blue800: '#1B448B',
  blue900: '#122F61',
  green: '#1E8A4C',
  greenSoft: 'rgba(30,138,76,0.12)',
  amber: '#C9821B',
  red: '#C0312B',
  white: '#FFFFFF',
  accentSoft: 'rgba(1,89,166,0.10)',
  amberSoft: 'rgba(201,130,27,0.12)',
  isDark: false,
};

export const DARK_THEME: ThemeTokens = {
  bg: '#0D1825',
  surface: '#152030',
  elevated: '#1C2E42',
  border: '#243344',
  borderMuted: '#2C3F52',
  fg: '#E2EBF3',
  fgMuted: '#6B8299',
  blue700: '#4BAEE8',
  blue800: '#1B448B',
  blue900: '#122F61',
  green: '#22A358',
  greenSoft: 'rgba(34,163,88,0.18)',
  amber: '#E09830',
  red: '#E04440',
  white: '#FFFFFF',
  accentSoft: 'rgba(75,174,232,0.15)',
  amberSoft: 'rgba(224,152,48,0.18)',
  isDark: true,
};

export function useTheme(): ThemeTokens {
  const isDark = useSettingsStore(s => s.darkMode);
  return isDark ? DARK_THEME : LIGHT_THEME;
}
