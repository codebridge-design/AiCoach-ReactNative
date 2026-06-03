import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Font } from '../../constants/typography';
import { useTheme } from '../../lib/theme';

type BadgeTone = 'neutral' | 'info' | 'success' | 'amber' | 'red' | 'outline' | 'onDark';

interface BadgeProps {
  tone?: BadgeTone;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  const theme = useTheme();

  const TONES: Record<BadgeTone, { bg: string; fg: string; border?: string }> = {
    neutral: { bg: theme.border,    fg: theme.fg },
    info:    { bg: theme.elevated,  fg: theme.blue700 },
    success: { bg: theme.greenSoft, fg: theme.green },
    amber:   { bg: theme.amberSoft, fg: theme.amber },
    red:     { bg: theme.isDark ? 'rgba(224,68,64,0.16)' : 'rgba(192,49,43,0.12)', fg: theme.red },
    outline: { bg: 'transparent',   fg: theme.fg, border: theme.borderMuted },
    onDark:  { bg: 'rgba(255,255,255,0.16)', fg: theme.white },
  };

  const t = TONES[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg, borderColor: t.border ?? 'transparent', borderWidth: t.border ? 1 : 0 }]}>
      <Text style={[styles.text, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { height: 22, paddingHorizontal: 10, borderRadius: 999, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  text: { fontFamily: Font.bold, fontSize: 11, letterSpacing: 0.2 },
});
