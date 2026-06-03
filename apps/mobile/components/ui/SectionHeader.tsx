import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Font } from '../../constants/typography';
import { useTheme } from '../../lib/theme';

interface SectionHeaderProps {
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({ children, action }: SectionHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { color: theme.fgMuted }]}>{children}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  text: { fontFamily: Font.semiBold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.72 },
});
