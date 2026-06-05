import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Font } from '../../constants/typography';
import { scoreColor } from '../../utils/score';
import { useTheme } from '../../lib/theme';

interface ScoreBarProps {
  label: string;
  value: number;
  animate?: boolean;
}

export function ScoreBar({ label, value, animate = true }: ScoreBarProps) {
  const theme = useTheme();
  const pct = Math.max(0, Math.min(1, value / 10));
  const width = useRef(new Animated.Value(animate ? 0 : pct)).current;

  useEffect(() => {
    if (!animate) { width.setValue(pct); return; }
    const t = setTimeout(() => Animated.timing(width, { toValue: pct, duration: 800, useNativeDriver: false }).start(), 60);
    return () => clearTimeout(t);
  }, [pct, animate]);

  const col = scoreColor(value);
  const barWidth = width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.fg }]}>{label}</Text>
        <Text style={[styles.value, { color: col }]}>{value.toFixed(1)}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.elevated }]}>
        <Animated.View style={[styles.fill, { width: barWidth, backgroundColor: col }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontFamily: Font.semiBold, fontSize: 13 },
  value: { fontFamily: Font.bold, fontSize: 13 },
  track: { height: 7, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
});
